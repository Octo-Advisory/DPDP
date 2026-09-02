import frappe
from frappe import _, get_template
import json
from frappe.utils.pdf import get_pdf
from frappe.utils import nowdate

@frappe.whitelist(allow_guest=True)
def signup_user(email, first_name, last_name, full_name, mobile_no=None, phone_code=None, phone_only=None, middle_name=None, country=None, redirect_to=None):
    """
    Custom signup method to capture additional user details.
    """
    # if not frappe.get_system_settings("allow_signup"):
    #     frappe.throw(_("Sign up is disabled for this site"))

    # Use the core signup logic to create the user and handle email verification
    # from frappe.core.doctype.user.user import signup
    # signup(email, full_name, redirect_to)

    # After signup creates the user, we update the record with the additional fields
    # user = frappe.get_doc("User", email)
    # user.db_set("first_name", first_name)
    # user.db_set("middle_name", middle_name)
    # user.db_set("last_name", last_name)
    # user.db_set("mobile_no", mobile_no)
    # user.db_set("location", country)
    # user.db_set("full_name", full_name)

    # Create record in User_dpdp DocType
    if not frappe.db.exists("User_dpdp", email):
        dpdp_user = frappe.get_doc({
            "doctype": "User_dpdp",
            "email": email,
            "first_name": first_name,
            "middle_name": middle_name,
            "last_name": last_name,
            "phone_code": phone_code,
            "phone": phone_only,
            "country": country
        })
        dpdp_user.insert(ignore_permissions=True)

    if not frappe.db.exists("User", email):
        user = frappe.get_doc({
            "doctype": "User",
            "email": email,
            "first_name": first_name,
            "middle_name": middle_name,
            "last_name": last_name,
            "send_welcome_email": 0,
            # "phone_code": phone_code,
            "phone": phone_only,
            "country": country
        })
        user.insert(ignore_permissions=True)

    # No email verification step in this version - the account is usable immediately.
    return _("Account created successfully")

@frappe.whitelist(allow_guest=True)
def set_user_password(email, password):
    """
    Sets the password for both the system User and the User_dpdp record.
    """
    if not email or not password:
        frappe.throw(_("Email and Password are required"))

    # Update system User password securely. Frappe hashes and stores this on
    # the core User doctype - that is the single source of truth for login,
    # so we deliberately do NOT duplicate the raw password anywhere else
    # (e.g. User_dpdp), which would otherwise persist it in plaintext.
    from frappe.utils.password import update_password
    update_password(email, password)

    return "Password set successfully"

@frappe.whitelist(allow_guest=True)
def get_countries():
    """
    Returns a list of countries and their calling codes.
    """
    return frappe.get_all("Country", fields=["name", "code", "phone_code"])

def _check_assessment_access(assessment):
    """
    Ensures the current session user owns this assessment (or is an admin),
    so one tenant cannot read/modify another tenant's assessment data.
    """
    if assessment.owner != frappe.session.user and "System Manager" not in frappe.get_roles():
        frappe.throw(_("You do not have permission to access this assessment"), frappe.PermissionError)

@frappe.whitelist()
def submit_assessment(assessment_name, answers):
    """
    Saves all answers, calculates section and overall scores, and updates the assessment.
    """
    if isinstance(answers, str):
        answers = json.loads(answers)

    assessment = frappe.get_doc("Assessment_dpdp", assessment_name)
    _check_assessment_access(assessment)

    # 1. Clear old responses if any
    frappe.db.delete("Assessment_Response_dpdp", {"assessment": assessment_name})

    # Batch-fetch question metadata for every answered question in one query
    # instead of an exists()+get_doc() pair per question (N+1).
    q_names = [q_name for q_name, ans_obj in answers.items() if ans_obj.get("value") is not None]
    questions_by_name = {
        q.name: q
        for q in frappe.get_all(
            "Question_dpdp", filters={"name": ["in", q_names]}, fields=["name", "section", "type"]
        )
    }

    # Batch-fetch section metadata (target_select, title) for every section
    # referenced by those questions in one query instead of per-question lookups.
    section_ids = list({q.section for q in questions_by_name.values() if q.section})
    sections_by_name = {
        s.name: s
        for s in frappe.get_all(
            "Section_dpdp", filters={"name": ["in", section_ids]}, fields=["name", "target_select", "title"]
        )
    }

    section_totals = {} # {section_id: {"score": 0, "max": 0}}

    for q_name, ans_obj in answers.items():
        val = ans_obj.get("value")
        if val is None: continue

        q_doc = questions_by_name.get(q_name)
        if not q_doc: continue
        section_id = q_doc.section

        section = sections_by_name.get(section_id)
        section_target = section.target_select if section else None

        # Skip discovery sections for scoring
        if not section_target or section_target == "None":
            # Still save response for audit, but no score calculation
            frappe.get_doc({
                "doctype": "Assessment_Response_dpdp",
                "assessment": assessment_name,
                "question": q_name,
                "response_value": str(val),
                "score": 0
            }).insert(ignore_permissions=True)
            continue

        # Calculate individual score
        score = 0
        if q_doc.type == "Scale 1-5":
            try:
                score = float(val)
            except ValueError:
                score = 0
        elif q_doc.type == "Multiple Choice":
            val_str = str(val)
            if val_str.startswith("A.") or val_str == "Yes": score = 5
            elif val_str.startswith("B."): score = 3
            else: score = 0

        # Save response
        frappe.get_doc({
            "doctype": "Assessment_Response_dpdp",
            "assessment": assessment_name,
            "question": q_name,
            "response_value": str(val),
            "score": score
        }).insert(ignore_permissions=True)

        # Track for section totals
        if section_id not in section_totals:
            section_totals[section_id] = {"score": 0, "max": 0}

        section_totals[section_id]["score"] += score
        section_totals[section_id]["max"] += 5

    # 2. Calculate Final Scores
    final_section_scores = {}
    total_earned = 0
    total_max = 0

    for s_id, totals in section_totals.items():
        section = sections_by_name.get(s_id)
        s_title = section.title if section else s_id
        percentage = (totals["score"] / totals["max"]) * 100 if totals["max"] > 0 else 0
        final_section_scores[s_title] = round(percentage, 1)
        total_earned += totals["score"]
        total_max += totals["max"]
        
    overall_percentage = (total_earned / total_max) * 100 if total_max > 0 else 0
    
    # 3. Update Assessment
    assessment.overall_score = round(overall_percentage, 1)
    assessment.section_scores = json.dumps(final_section_scores)
    assessment.status = "Completed"
    assessment.save(ignore_permissions=True)
    
    return {
        "overall_score": assessment.overall_score,
        "section_scores": final_section_scores
    }

@frappe.whitelist()
def get_assessment_results(assessment_name):
    """
    Returns scores and gap analysis for the results page.
    """
    assessment = frappe.get_doc("Assessment_dpdp", assessment_name)
    _check_assessment_access(assessment)

    # Get low-scoring responses for gap analysis (from functional sections only)
    responses = frappe.db.sql("""
        SELECT r.question, r.response_value, r.score, q.text
        FROM `tabAssessment_Response_dpdp` r
        JOIN `tabQuestion_dpdp` q ON r.question = q.name
        JOIN `tabSection_dpdp` s ON q.section = s.name
        WHERE r.assessment = %s 
          AND r.score < 3 
          AND s.target_select != 'None'
          AND s.target_select IS NOT NULL
    """, (assessment_name,), as_dict=1)
    
    gaps = []
    for r in responses:
        gaps.append({
            "question": r.text,
            "response": r.response_value,
            "impact": "High" if r.score == 0 else "Medium"
        })
        
    return {
        "overall_score": assessment.overall_score,
        "section_scores": json.loads(assessment.section_scores or "{}"),
        "identified_role": assessment.identified_role,
        "gaps": gaps,
        "status": assessment.status
    }
def cleanup_assessment_responses(doc, method):
    """
    Called via hooks to delete responses when an assessment is trashed.
    Since Assessment_dpdp is a 'Custom' DocType, we use hooks instead of controller methods.
    """
    frappe.db.delete("Assessment_Response_dpdp", {"assessment": doc.name})

@frappe.whitelist()
def download_report(assessment_name):
    """
    Generates and returns a PDF report for the given assessment.
    """
    # 1. Fetch Assessment Data
    assessment = frappe.get_doc("Assessment_dpdp", assessment_name)
    _check_assessment_access(assessment)
    org_name = frappe.db.get_value("Organization_dpdp", assessment.organization, "organization_name") or assessment.organization
    
    # 2. Get Gaps (using same logic as get_assessment_results)
    responses = frappe.db.sql("""
        SELECT r.question, r.response_value, r.score, q.text
        FROM `tabAssessment_Response_dpdp` r
        JOIN `tabQuestion_dpdp` q ON r.question = q.name
        JOIN `tabSection_dpdp` s ON q.section = s.name
        WHERE r.assessment = %s 
          AND r.score < 3 
          AND s.target_select != 'None'
          AND s.target_select IS NOT NULL
    """, (assessment_name,), as_dict=1)
    
    gaps = []
    for r in responses:
        gaps.append({
            "question": r.text,
            "impact": "High" if r.score == 0 else "Medium"
        })

    # 3. Prepare Template Context
    section_scores = json.loads(assessment.section_scores or "{}")
    overall = assessment.overall_score or 0
    
    status_title = "Ready for Compliance" if overall > 80 else "Action Required"
    status_message = "Your organization has demonstrated strong alignment with DPDP principles." if overall > 80 else "Several critical areas require immediate attention to reach compliance readiness."

    context = {
        "organization": org_name,
        "date": nowdate(),
        "overall_score": overall,
        "section_scores": section_scores,
        "gaps": gaps,
        "role": assessment.identified_role,
        "status_title": status_title,
        "status_message": status_message
    }

    # 4. Render HTML and Convert to PDF
    html = get_template("templates/report_template.html").render(context)
    pdf_content = get_pdf(html)

    # 5. Send as file response
    frappe.response.filename = f"DPDP_Report_{assessment_name}.pdf"
    frappe.response.filecontent = pdf_content
    frappe.response.type = "download"
