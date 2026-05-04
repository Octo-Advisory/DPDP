import frappe

def setup_section_1():
    # 1. Ensure Version exists
    version_id = "v1"
    if not frappe.db.exists("Questionnaire_Version_dpdp", {"version_id": version_id}):
        version = frappe.get_doc({
            "doctype": "Questionnaire_Version_dpdp",
            "version_id": version_id,
            "active": 1
        })
        version.insert(ignore_permissions=True)
        version_name = version.name
    else:
        version_name = frappe.db.get_value("Questionnaire_Version_dpdp", {"version_id": version_id}, "name")
    
    # 2. Create Section
    section_title = "Role Identification"
    if not frappe.db.exists("Section_dpdp", {"title": section_title, "version": version_name}):
        section = frappe.get_doc({
            "doctype": "Section_dpdp",
            "title": section_title,
            "version": version_name,
            "order": 1,
            "target_select": "None" # Visibility: Always
        })
        section.insert(ignore_permissions=True)
    else:
        section = frappe.get_doc("Section_dpdp", {"title": section_title, "version": version_name})

    # 3. Create Question
    q_text = "Which role best describes your organization in relation to personal data?"
    if not frappe.db.exists("Question_dpdp", {"text": q_text, "section": section.name}):
        question = frappe.get_doc({
            "doctype": "Question_dpdp",
            "text": q_text,
            "section": section.name,
            "type": "Multiple Choice",
            "options": '["Data Fiduciary", "Data Processor", "Significant Data Fiduciary", "Not sure"]',
            "order": 1,
            "updates_role": 1
        })
        question.insert(ignore_permissions=True)
    
    frappe.db.commit()
    return "Section 1 Setup Complete"

def setup_section_2():
    version_name = frappe.db.get_value("Questionnaire_Version_dpdp", {"version_id": "v1"}, "name")
    
    # 2. Create Section
    section_title = "Role Clarification"
    if not frappe.db.exists("Section_dpdp", {"title": section_title, "version": version_name}):
        section = frappe.get_doc({
            "doctype": "Section_dpdp",
            "title": section_title,
            "version": version_name,
            "order": 2,
            "target_select": "None" # Visibility logic is hardcoded for this title
        })
        section.insert(ignore_permissions=True)
    else:
        section = frappe.get_doc("Section_dpdp", {"title": section_title, "version": version_name})

    # 3. Create Questions
    questions = [
        {
            "text": "Does your organization decide why personal data is collected and how it is used?",
            "options": '["A. Yes, we decide purpose and means", "B. We mainly act on another organization’s instructions", "C. Both, depending on the engagement", "D. Not sure"]'
        },
        {
            "text": "Does your organization process personal data on behalf of another organization under contract or written instructions?",
            "options": '["A. Yes, regularly", "B. Sometimes", "C. No", "D. Not sure"]'
        },
        {
            "text": "Does your organization primarily provide services, platforms, hosting, analytics, or operational support using another organization’s data?",
            "options": '["A. Yes", "B. Partly", "C. No", "D. Not sure"]'
        },
        {
            "text": "Is your organization involved in large-scale or high-impact personal data processing that may require enhanced governance, DPIA, or DPO oversight?",
            "options": '["A. Yes", "B. Possibly / under review", "C. No", "D. Not sure"]'
        }
    ]

    for i, q in enumerate(questions):
        if not frappe.db.exists("Question_dpdp", {"text": q["text"], "section": section.name}):
            frappe.get_doc({
                "doctype": "Question_dpdp",
                "text": q["text"],
                "section": section.name,
                "type": "Multiple Choice",
                "options": q["options"],
                "order": i + 1
            }).insert(ignore_permissions=True)
    
    frappe.db.commit()
    return "Section 2 Setup Complete"

def setup_section_3():
    version_name = frappe.db.get_value("Questionnaire_Version_dpdp", {"version_id": "v1"}, "name")
    
    # 2. Create Section
    section_title = "Applicability Questions"
    if not frappe.db.exists("Section_dpdp", {"title": section_title, "version": version_name}):
        section = frappe.get_doc({
            "doctype": "Section_dpdp",
            "title": section_title,
            "version": version_name,
            "order": 3,
            "target_select": "None" # In discovery phase, but after role identified
        })
        section.insert(ignore_permissions=True)
    else:
        section = frappe.get_doc("Section_dpdp", {"title": section_title, "version": version_name})

    # 3. Create Questions
    q1_text = "Does your organization collect, store, use, or otherwise process personal data of children?"
    if not frappe.db.exists("Question_dpdp", {"text": q1_text, "section": section.name}):
        frappe.get_doc({
            "doctype": "Question_dpdp",
            "text": q1_text,
            "section": section.name,
            "type": "Multiple Choice",
            "options": '["A. Yes", "B. No"]',
            "order": 1,
            "updates_flag": "process_children_data"
        }).insert(ignore_permissions=True)

    q2_text = "Is personal data stored outside India, transferred outside India, or accessed from outside India?"
    if not frappe.db.exists("Question_dpdp", {"text": q2_text, "section": section.name}):
        frappe.get_doc({
            "doctype": "Question_dpdp",
            "text": q2_text,
            "section": section.name,
            "type": "Multiple Choice",
            "options": '["A. Yes", "B. No"]',
            "order": 2,
            "updates_flag": "cross_border_transfer"
        }).insert(ignore_permissions=True)
    
    frappe.db.commit()
    return "Section 3 Setup Complete"

def setup_data_fiduciary():
    version_name = frappe.db.get_value("Questionnaire_Version_dpdp", {"version_id": "v1"}, "name")
    
    sections_data = [
        {
            "title": "Applicability & Role Clarity",
            "trigger": "None",
            "questions": [
                {"text": "Do you maintain one central list or register of all systems and applications that handle personal data?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Do you regularly identify and review unofficial or unapproved systems that may be handling personal data?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Where responsibility is shared with another organization, is that arrangement formally documented?", "type": "Scale 1-5", "options": "[]"},
                {"text": "How are new vendors assessed before they are onboarded?", "type": "Multiple Choice", "options": '["A. Through a risk-based review that includes DPDP checks", "B. Through a standard vendor checklist", "C. Through commercial review only", "D. There is no defined method"]'}
            ]
        },
        {
            "title": "Consent & Notice",
            "trigger": "None",
            "questions": [
                {"text": "Are your consent collection processes version-controlled, with older notice versions saved for recordkeeping?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is personal data tagged by purpose at the database level so it is not used beyond the purpose originally agreed to?", "type": "Scale 1-5", "options": "[]"},
                {"text": "When consent is collected offline, such as through paper or in-store forms, is it digitized and kept in an auditable form?", "type": "Scale 1-5", "options": "[]"},
                {"text": "If bundled consent is used for operational reasons, is the legal justification properly documented?", "type": "Multiple Choice", "options": '["A. Yes, formally documented", "B. Informally justified", "C. No documentation", "D. Not reviewed"]'}
            ]
        },
        {
            "title": "Data Lifecycle & Retention",
            "trigger": "None",
            "questions": [
                {"text": "Have you mapped how personal data moves through the organization, from collection to deletion, including sharing with third parties?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Do retention controls also apply to test and staging environments?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Do you periodically test whether anonymized data truly cannot be reversed or re-identified?", "type": "Scale 1-5", "options": "[]"},
                {"text": "How is legacy personal data handled?", "type": "Multiple Choice", "options": '["A. It is migrated and retention controls are applied", "B. It is archived without review", "C. It is kept indefinitely", "D. It has not been assessed"]'}
            ]
        },
        {
            "title": "Data Security & Breach Response",
            "trigger": "None",
            "questions": [
                {"text": "Are encryption keys stored and managed separately from the systems where personal data is stored?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Do you have documented criteria for classifying the severity of a data breach?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Do contracts with third parties require them to notify you of breaches within a defined time period?", "type": "Scale 1-5", "options": "[]"},
                {"text": "How often are penetration tests conducted for systems that process personal data?", "type": "Multiple Choice", "options": '["A. Annually or more often", "B. Every 2–3 years", "C. On an ad-hoc basis", "D. Never"]'}
            ]
        },
        {
            "title": "Children’s Data",
            "trigger": "process_children_data",
            "questions": [
                {"text": "Can parental consent records be independently verified and retrieved when needed?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are child accounts reviewed again when the child reaches the age of majority?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are systems technically designed to prevent targeted advertising for child profiles?", "type": "Scale 1-5", "options": "[]"},
                {"text": "How are parental requests to withdraw consent handled?", "type": "Multiple Choice", "options": '["A. Through a defined SLA with escalation", "B. Through a standard SLA", "C. Through informal handling", "D. There is no defined process"]'}
            ]
        },
        {
            "title": "Rights of Data Principals",
            "trigger": "None",
            "questions": [
                {"text": "Are identity checks for rights requests matched to the level of risk involved in the request?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Do you review rejected rights requests to identify possible bias or repeated wrongful denial?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is there a defined maximum timeline for completing rights requests?", "type": "Multiple Choice", "options": '["A. Yes, through a documented SLA", "B. There is an informal expectation", "C. It is handled case by case", "D. There is no defined timeline"]'},
                {"text": "Are third-party processors contractually required to support your timelines for handling data principal rights requests?", "type": "Scale 1-5", "options": "[]"}
            ]
        },
        {
            "title": "Governance & Accountability",
            "trigger": "None",
            "questions": [
                {"text": "Is DPDP compliance included in your annual internal audit scope?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are privacy-related KPIs reported to senior leadership on a regular basis?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are privacy non-compliance incidents recorded in formal risk registers?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is there a defined disciplinary process for employees who violate privacy requirements?", "type": "Multiple Choice", "options": '["A. Yes, through a formal documented policy", "B. It is handled case by case", "C. It is handled informally", "D. There is no defined process"]'}
            ]
        },
        {
            "title": "Cross-Border Data Transfers",
            "trigger": "cross_border_transfer",
            "questions": [
                {"text": "Do you maintain a current register of all countries or jurisdictions where personal data is stored or accessed?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are cross-border transfers reviewed by legal or compliance teams before they take place?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are access logs for foreign vendors reviewed regularly?", "type": "Scale 1-5", "options": "[]"},
                {"text": "If a jurisdiction becomes restricted by Government notification, is there a documented response plan?", "type": "Multiple Choice", "options": '["A. Yes, with a defined exit or migration strategy", "B. The approach depends on the vendor", "C. There is no contingency plan", "D. It has not been assessed"]'}
            ]
        }
    ]

    base_order = 4
    for s_idx, s_data in enumerate(sections_data):
        section_title = s_data["title"]
        if not frappe.db.exists("Section_dpdp", {"title": section_title, "version": version_name}):
            section = frappe.get_doc({
                "doctype": "Section_dpdp",
                "title": section_title,
                "version": version_name,
                "order": base_order + s_idx,
                "target_select": "Data Fiduciary",
                "applicability_trigger": s_data["trigger"]
            })
            section.insert(ignore_permissions=True)
        else:
            section = frappe.get_doc("Section_dpdp", {"title": section_title, "version": version_name})
            section.target_select = "Data Fiduciary"
            section.applicability_trigger = s_data["trigger"]
            section.save(ignore_permissions=True)

        for q_idx, q_data in enumerate(s_data["questions"]):
            if not frappe.db.exists("Question_dpdp", {"text": q_data["text"], "section": section.name}):
                frappe.get_doc({
                    "doctype": "Question_dpdp",
                    "text": q_data["text"],
                    "section": section.name,
                    "type": q_data["type"],
                    "options": q_data["options"],
                    "order": q_idx + 1
                }).insert(ignore_permissions=True)
    
    frappe.db.commit()
    return "Data Fiduciary Setup Complete"

def setup_data_processor():
    version_name = frappe.db.get_value("Questionnaire_Version_dpdp", {"version_id": "v1"}, "name")
    
    sections_data = [
        {
            "title": "Applicability & Role Clarity",
            "trigger": "None",
            "questions": [
                {"text": "Do you maintain a record of all client-specific processing activities and link them to the written instructions received from the Data Fiduciary?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are your internal teams prevented from using client data for analytics, AI training, or internal improvement unless authorized?", "type": "Scale 1-5", "options": "[]"},
                {"text": "If client instructions conflict with internal policies, are those conflicts escalated to compliance or legal teams before work continues?", "type": "Scale 1-5", "options": "[]"},
                {"text": "How do you prevent your organization from independently deciding the purpose of processing client data?", "type": "Multiple Choice", "options": '["A. Through system-level restrictions", "B. Through compliance oversight review", "C. Through business team discretion", "D. It is not formally prevented"]'}
            ]
        },
        {
            "title": "Consent & Notice",
            "trigger": "None",
            "questions": [
                {"text": "If you operate as a white-label platform, can privacy notices be configured separately for each client?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are notice changes implemented only after the client has formally approved them?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are consent logs preserved in their original form without being altered by your systems?", "type": "Scale 1-5", "options": "[]"},
                {"text": "What happens when consent is withdrawn?", "type": "Multiple Choice", "options": '["A. Processing is stopped immediately and the Data Fiduciary is informed", "B. Processing continues until the Data Fiduciary confirms", "C. The matter goes to manual review", "D. There is no defined process"]'}
            ]
        },
        {
            "title": "Data Lifecycle & Retention",
            "trigger": "None",
            "questions": [
                {"text": "Is client data encrypted both while stored and while being transmitted across all environments?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Do you have controls that logically and physically separate one client’s data from another client’s data?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are temporary files created during processing automatically deleted after use?", "type": "Scale 1-5", "options": "[]"},
                {"text": "When a contract ends, how do you confirm that client data has been deleted?", "type": "Multiple Choice", "options": '["A. Through an automated deletion workflow with an audit log", "B. Through manual deletion confirmation", "C. Through vendor assurance only", "D. It is not validated"]'}
            ]
        },
        {
            "title": "Data Security & Breach Response",
            "trigger": "None",
            "questions": [
                {"text": "Are client-specific breach notification timelines built into your incident response playbooks?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Do you perform a root cause analysis for every breach involving client data?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Do you run breach simulations that include how you would communicate with the client?", "type": "Scale 1-5", "options": "[]"},
                {"text": "How do you measure the extent of client-specific data exposure during an incident?", "type": "Multiple Choice", "options": '["A. Through a structured data impact matrix", "B. Through technical estimation only", "C. Through client-driven inquiry", "D. There is no defined method"]'}
            ]
        },
        {
            "title": "Children’s Data",
            "trigger": "process_children_data",
            "questions": [
                {"text": "Are children’s data processing rules configured separately based on each client’s instructions?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Do your systems technically prevent unauthorized analytics or algorithm training using children’s data?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is access to children’s data limited to only specific authorized roles?", "type": "Scale 1-5", "options": "[]"},
                {"text": "If you are told to process children’s data without proper proof of consent, what do you do?", "type": "Multiple Choice", "options": '["A. Escalate the issue and suspend processing", "B. Seek clarification but continue processing", "C. Carry out the instruction as given", "D. There is no defined process"]'}
            ]
        },
        {
            "title": "Rights of Data Principals",
            "trigger": "None",
            "questions": [
                {"text": "Do you have a documented SLA for supporting the Data Fiduciary in handling rights requests?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Do you maintain internal logs to show that you acted on the Data Fiduciary’s instructions for rights requests?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are correction and deletion instructions enforced across analytics systems, backups, and archives as well?", "type": "Scale 1-5", "options": "[]"},
                {"text": "If a Data Principal contacts you directly, what is the standard response?", "type": "Multiple Choice", "options": '["A. Redirect them immediately to the Data Fiduciary and log the event", "B. Respond after informal internal review", "C. Provide limited information", "D. There is no defined policy"]'}
            ]
        },
        {
            "title": "Governance & Accountability",
            "trigger": "None",
            "questions": [
                {"text": "Are your sub-processors required to maintain equivalent security and compliance certifications?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Do you maintain a centralized inventory of all sub-processors and their roles in processing?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Do you periodically review sub-processor performance and compliance?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is DPDP compliance included in client dashboards or contract performance reviews?", "type": "Multiple Choice", "options": '["A. Yes, through structured reporting", "B. It is provided on request", "C. It is shared informally", "D. It is not included"]'}
            ]
        },
        {
            "title": "Cross-Border Data Transfers",
            "trigger": "cross_border_transfer",
            "questions": [
                {"text": "Are overseas hosting locations fixed by contract and subject to change control?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are transfer logs available for review by the Data Fiduciary?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are foreign access credentials rotated and audited regularly?", "type": "Scale 1-5", "options": "[]"},
                {"text": "If a jurisdiction becomes legally restricted, what is the defined response?", "type": "Multiple Choice", "options": '["A. Immediately suspend processing and activate a migration plan", "B. Wait for the Data Fiduciary’s instruction", "C. Continue operations", "D. There is no defined response"]'}
            ]
        }
    ]

    base_order = 12 # Data Processor sections will follow Data Fiduciary ones (4 discovery + 8 Fiduciary)
    for s_idx, s_data in enumerate(sections_data):
        section_title = s_data["title"]
        # Use target_select in filter to allow duplicate titles for different roles
        if not frappe.db.exists("Section_dpdp", {"title": section_title, "version": version_name, "target_select": "Data Processor"}):
            section = frappe.get_doc({
                "doctype": "Section_dpdp",
                "title": section_title,
                "version": version_name,
                "order": base_order + s_idx,
                "target_select": "Data Processor",
                "applicability_trigger": s_data["trigger"]
            })
            section.insert(ignore_permissions=True)
        else:
            section = frappe.get_doc("Section_dpdp", {"title": section_title, "version": version_name, "target_select": "Data Processor"})

        for q_idx, q_data in enumerate(s_data["questions"]):
            if not frappe.db.exists("Question_dpdp", {"text": q_data["text"], "section": section.name}):
                frappe.get_doc({
                    "doctype": "Question_dpdp",
                    "text": q_data["text"],
                    "section": section.name,
                    "type": q_data["type"],
                    "options": q_data["options"],
                    "order": q_idx + 1
                }).insert(ignore_permissions=True)
    
    frappe.db.commit()
    return "Data Processor Setup Complete"

def setup_significant_data_fiduciary():
    version_name = frappe.db.get_value("Questionnaire_Version_dpdp", {"version_id": "v1"}, "name")
    
    sections_data = [
        {
            "title": "Applicability & Systemic Risk Assessment",
            "trigger": "None",
            "questions": [
                {"text": "Do you have a documented method to classify processing activities as high-risk based on volume, sensitivity, and possible harm?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are high-risk processing registers reviewed by the Board or executive committee?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Do you use automated risk scoring tools to continuously assess new or changed processing activities?", "type": "Scale 1-5", "options": "[]"},
                {"text": "How do you assess the combined risk of harm when multiple datasets are used together?", "type": "Multiple Choice", "options": '["A. Through an integrated risk modelling approach", "B. Through manual compliance review", "C. Only after incidents occur", "D. It is not evaluated"]'}
            ]
        },
        {
            "title": "DPIA Governance",
            "trigger": "None",
            "questions": [
                {"text": "Are DPIAs built into the product development lifecycle and SDLC checkpoints?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are rejected or high-risk DPIAs escalated to senior management before work proceeds?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are remaining DPIA risks formally documented and accepted at executive level?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are DPIA outcomes linked to actual technical mitigation controls and implementation tracking?", "type": "Scale 1-5", "options": "[]"}
            ]
        },
        {
            "title": "Advanced Consent & Transparency Controls",
            "trigger": "None",
            "questions": [
                {"text": "Are consent processes regularly tested for bias, fairness, and accessibility, especially for vulnerable groups?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Where applicable, are AI-driven or algorithm-based decisions clearly disclosed in privacy notices?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are notices and consent mechanisms available in multiple languages for high-risk data subjects where needed?", "type": "Scale 1-5", "options": "[]"},
                {"text": "How often are consent user experience patterns independently reviewed?", "type": "Multiple Choice", "options": '["A. Annually", "B. Every two years", "C. Only after incidents", "D. They are not audited"]'}
            ]
        },
        {
            "title": "Data Lifecycle & Enterprise Integration",
            "trigger": "None",
            "questions": [
                {"text": "Are retention controls aligned across subsidiaries, joint ventures, and international branches?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are anonymization and pseudonymization techniques formally tested and validated for effectiveness?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are system logs reviewed regularly to detect use of data beyond the intended purpose?", "type": "Scale 1-5", "options": "[]"},
                {"text": "During mergers, acquisitions, or data integration activities, is data minimization formally enforced?", "type": "Multiple Choice", "options": '["A. Through a formal privacy due diligence process", "B. Through partial review", "C. Through commercial review only", "D. It is not assessed"]'}
            ]
        },
        {
            "title": "Advanced Security & Monitoring",
            "trigger": "None",
            "questions": [
                {"text": "Do you use real-time anomaly detection for systems that process large amounts of personal data?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Do you conduct red-team exercises to test how well your systems can withstand breaches?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are third-party access channels continuously monitored for suspicious activity?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are security budgets compared against industry benchmarks for large-scale personal data environments?", "type": "Multiple Choice", "options": '["A. Yes, annually", "B. Occasionally", "C. On an ad-hoc basis", "D. They are not benchmarked"]'}
            ]
        },
        {
            "title": "Children’s Data – Enhanced Safeguards",
            "trigger": "process_children_data",
            "questions": [
                {"text": "Are algorithmic systems specifically reviewed for indirect child profiling risks?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are child accounts automatically transitioned and fresh consent obtained when the user reaches the age of majority?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are there enhanced breach notification procedures for incidents involving children’s data?", "type": "Scale 1-5", "options": "[]"},
                {"text": "How are analytics involving children’s data restricted?", "type": "Multiple Choice", "options": '["A. Through technical controls in code or configuration", "B. Through policy only", "C. Through case-by-case approval", "D. They are not restricted"]'}
            ]
        },
        {
            "title": "Rights Management at Scale",
            "trigger": "None",
            "questions": [
                {"text": "Do you use AI or automation tools to manage and triage large volumes of rights requests?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are there defined exception-handling workflows for complex or abusive request patterns?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Do you analyze request trends to identify broader privacy weaknesses in the organization?", "type": "Scale 1-5", "options": "[]"},
                {"text": "How are rights request metrics reported in enterprise risk dashboards?", "type": "Multiple Choice", "options": '["A. Quarterly", "B. Annually", "C. Only after incidents", "D. They are not reported"]'}
            ]
        },
        {
            "title": "Governance, DPO & Board Oversight",
            "trigger": "None",
            "questions": [
                {"text": "Is the DPO function financially and operationally independent from business units that generate revenue?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Does the DPO have documented authority to access all systems involved in data processing?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are Board members trained regularly on DPDP risks and penalties?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is executive compensation partly tied to compliance KPIs?", "type": "Multiple Choice", "options": '["A. Yes, formally", "B. Informally considered", "C. Not linked", "D. Not evaluated"]'}
            ]
        },
        {
            "title": "Independent Audit & Regulatory Preparedness",
            "trigger": "None",
            "questions": [
                {"text": "Are independent external DPDP compliance audits conducted?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are regulatory response playbooks documented and tested?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Do you maintain one central repository for compliance evidence and documentation?", "type": "Scale 1-5", "options": "[]"},
                {"text": "How often are independent audits conducted?", "type": "Multiple Choice", "options": '["A. Every year", "B. Every two years", "C. Only when risk triggers it", "D. Not conducted"]'}
            ]
        },
        {
            "title": "Cross-Border Transfers – Enhanced Oversight",
            "trigger": "cross_border_transfer",
            "questions": [
                {"text": "Are transfer risk assessments reviewed by senior governance bodies before cross-border transfers take place?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are overseas vendors periodically re-evaluated and required to maintain compliance certifications?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Do you monitor geopolitical and regulatory developments in the jurisdictions where data is stored or processed?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is there a structured exit plan for high-risk jurisdictions?", "type": "Multiple Choice", "options": '["A. A documented migration plan exists", "B. The plan depends on the vendor", "C. The approach is informal", "D. There is no defined strategy"]'}
            ]
        }
    ]

    base_order = 20
    for s_idx, s_data in enumerate(sections_data):
        section_title = s_data["title"]
        if not frappe.db.exists("Section_dpdp", {"title": section_title, "version": version_name, "target_select": "Significant Data Fiduciary"}):
            section = frappe.get_doc({
                "doctype": "Section_dpdp",
                "title": section_title,
                "version": version_name,
                "order": base_order + s_idx,
                "target_select": "Significant Data Fiduciary",
                "applicability_trigger": s_data["trigger"]
            })
            section.insert(ignore_permissions=True)
        else:
            section = frappe.get_doc("Section_dpdp", {"title": section_title, "version": version_name, "target_select": "Significant Data Fiduciary"})

        for q_idx, q_data in enumerate(s_data["questions"]):
            if not frappe.db.exists("Question_dpdp", {"text": q_data["text"], "section": section.name}):
                frappe.get_doc({
                    "doctype": "Question_dpdp",
                    "text": q_data["text"],
                    "section": section.name,
                    "type": q_data["type"],
                    "options": q_data["options"],
                    "order": q_idx + 1
                }).insert(ignore_permissions=True)
    
    frappe.db.commit()
    return "Significant Data Fiduciary Setup Complete"
