
import requests
import json

# Configuration
BASE_URL = "http://64.227.187.13:82"
API_KEY = "fc6a50bb662fe6f"
API_SECRET = "bc2a54157dae9d9"

HEADERS = {
    "Authorization": f"token {API_KEY}:{API_SECRET}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

def frappe_post(doctype, data):
    url = f"{BASE_URL}/api/resource/{doctype}"
    response = requests.post(url, headers=HEADERS, json=data)
    if response.status_code != 200:
        print(f"Error {response.status_code} on {doctype}: {response.text}")
    try:
        return response.json()
    except Exception:
        return {}

def seed_sdf():
    print("Seeding Significant Data Fiduciary (SDF) Questions to Local Instance...")
    
    # 1. Get current version
    version_label = "DPDP v2.2 - Discovery"
    url = f"{BASE_URL}/api/resource/Questionnaire_Version_dpdp"
    params = {"filters": json.dumps([["version_id", "=", version_label]])}
    r = requests.get(url, headers=HEADERS, params=params)
    existing = r.json().get("data", [])
    if existing:
        v_id = existing[0]["name"]
        print(f"Adding to version: {v_id}")
    else: 
        print("Aborting: Version not found.")
        return

    # 2. Section Data for SDF
    sdf_sections = [
        {
            "title": "Applicability & Systemic Risk Assessment (SDF)",
            "order": 30,
            "target_select": "Significant Data Fiduciary",
            "questions": [
                {"text": "Is there a formally documented methodology to classify processing activities as high-risk based on volume, sensitivity, and potential harm?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are high-risk processing registers reviewed at Board or executive committee level?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are automated risk scoring tools used to continuously assess new or modified processing activities?", "type": "Scale 1-5", "options": "[]"},
                {"text": "How is cumulative harm risk evaluated across multiple datasets?", "type": "Multiple Choice", "options": json.dumps(["A. Integrated risk modelling approach", "B. Manual review by compliance", "C. Only incident-driven review", "D. Not evaluated"])}
            ]
        },
        {
            "title": "DPIA Governance (SDF)",
            "order": 31,
            "target_select": "Significant Data Fiduciary",
            "questions": [
                {"text": "Are DPIAs integrated into product development lifecycle (SDLC) checkpoints?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are rejected or high-risk DPIAs escalated to senior management before proceeding?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are DPIA residual risks formally documented and accepted at executive level?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are DPIA outputs linked to system-level mitigation controls (technical implementation tracking)?", "type": "Scale 1-5", "options": "[]"}
            ]
        },
        {
            "title": "Advanced Consent & Transparency Controls (SDF)",
            "order": 32,
            "target_select": "Significant Data Fiduciary",
            "questions": [
                {"text": "Are consent flows periodically tested for bias, fairness, and accessibility for vulnerable populations?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are algorithmic or AI-driven decision systems transparently disclosed in notices where applicable?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is multilingual accessibility implemented for high-risk data subjects?", "type": "Scale 1-5", "options": "[]"},
                {"text": "How frequently are consent UX patterns independently audited?", "type": "Multiple Choice", "options": json.dumps(["A. Annually", "B. Biennially", "C. Incident-driven", "D. Not audited"])}
            ]
        },
        {
            "title": "Data Lifecycle & Enterprise Integration (SDF)",
            "order": 33,
            "target_select": "Significant Data Fiduciary",
            "questions": [
                {"text": "Are retention controls harmonized across subsidiaries, joint ventures, and international branches?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are anonymization/pseudonymization techniques formally validated for effectiveness?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are system logs periodically reviewed to detect purpose deviation?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is data minimization enforced during mergers, acquisitions, or data integrations?", "type": "Multiple Choice", "options": json.dumps(["A. Formal privacy due diligence process", "B. Partial review", "C. Commercial focus only", "D. Not assessed"])}
            ]
        },
        {
            "title": "Advanced Security & Monitoring (SDF)",
            "order": 34,
            "target_select": "Significant Data Fiduciary",
            "questions": [
                {"text": "Is real-time anomaly detection deployed for large-scale personal data systems?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are red-team exercises conducted to test breach resilience?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are third-party access channels continuously monitored for unusual patterns?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are security budgets benchmarked against industry standards for large-scale data environments?", "type": "Multiple Choice", "options": json.dumps(["A. Yes, annually benchmarked", "B. Occasionally reviewed", "C. Ad-hoc budgeting", "D. Not benchmarked"])}
            ]
        },
        {
            "title": "Children’s Data – Enhanced Safeguards (SDF)",
            "order": 35,
            "target_select": "Significant Data Fiduciary",
            "applicability_trigger": "process_children_data",
            "questions": [
                {"text": "Are algorithmic systems audited specifically for indirect child profiling risks?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are child accounts automatically transitioned and re-consented upon reaching majority age?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are enhanced breach notification protocols defined for incidents involving children’s data?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are children’s data analytics restricted at code/configuration level?", "type": "Multiple Choice", "options": json.dumps(["A. Technically enforced", "B. Policy-based only", "C. Case-by-case approval", "D. Not restricted"])}
            ]
        },
        {
            "title": "Rights Management at Scale (SDF)",
            "order": 36,
            "target_select": "Significant Data Fiduciary",
            "questions": [
                {"text": "Are AI or automation tools used to triage high-volume rights requests?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are exception-handling workflows defined for complex or abusive request patterns?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are trend analyses performed to identify systemic privacy weaknesses from rights data?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are rights request metrics presented in enterprise risk dashboards?", "type": "Multiple Choice", "options": json.dumps(["A. Quarterly reporting", "B. Annual summary", "C. Incident-driven only", "D. Not reported"])}
            ]
        },
        {
            "title": "Governance, DPO & Board Oversight (SDF)",
            "order": 37,
            "target_select": "Significant Data Fiduciary",
            "questions": [
                {"text": "Is the DPO function financially and operationally independent from revenue-generating units?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Does the DPO have documented authority to access all data processing systems?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are Board members trained periodically on DPDP exposure and penalties?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is executive compensation partially linked to compliance KPIs?", "type": "Multiple Choice", "options": json.dumps(["A. Yes, formally integrated", "B. Informally considered", "C. Not linked", "D. Not evaluated"])}
            ]
        },
        {
            "title": "Independent Audit & Regulatory Preparedness (SDF)",
            "order": 38,
            "target_select": "Significant Data Fiduciary",
            "questions": [
                {"text": "Are external DPDP compliance audits conducted by independent assessors?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are regulatory inquiry response playbooks documented and tested?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is there a centralized evidence repository for compliance documentation?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Independent audit cadence:", "type": "Multiple Choice", "options": json.dumps(["A. Annual", "B. Biennial", "C. Risk-triggered", "D. None"])}
            ]
        },
        {
            "title": "Cross-Border Transfers – Enhanced Oversight (SDF)",
            "order": 39,
            "target_select": "Significant Data Fiduciary",
            "applicability_trigger": "cross_border_transfer",
            "questions": [
                {"text": "Are transfer risk assessments reviewed by senior governance bodies before execution?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are overseas vendors subject to periodic compliance certifications and re-evaluations?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are geopolitical and regulatory monitoring systems in place for jurisdictions where data resides?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is there a structured exit strategy for high-risk jurisdictions?", "type": "Multiple Choice", "options": json.dumps(["A. Documented migration plan", "B. Vendor-dependent plan", "C. Informal approach", "D. No defined strategy"])}
            ]
        }
    ]

    for s in sdf_sections:
        # Check if already exists
        url = f"{BASE_URL}/api/resource/Section_dpdp"
        params = {"filters": json.dumps([["version", "=", v_id], ["title", "=", s["title"]]])}
        r = requests.get(url, headers=HEADERS, params=params)
        existing_s = r.json().get("data", [])
        
        if existing_s:
            print(f"Skipping existing Section: {s['title']}")
            s_id = existing_s[0]["name"]
        else:
            print(f"Creating Section: {s['title']}")
            s_doc = frappe_post("Section_dpdp", {
                "title": s["title"],
                "version": v_id,
                "order": s["order"],
                "target_select": s["target_select"],
                "applicability_trigger": s.get("applicability_trigger", "None")
            })
            s_id = s_doc.get("data", {}).get("name")
        
        if not s_id: continue
        
        for idx, q in enumerate(s["questions"]):
            # Check if question exists in this section
            url = f"{BASE_URL}/api/resource/Question_dpdp"
            params = {"filters": json.dumps([["section", "=", s_id], ["text", "=", q["text"]]])}
            
            # Simple check
            r_q = requests.get(url, headers=HEADERS, params=params)
            if r_q.json().get("data", []):
                continue

            frappe_post("Question_dpdp", {
                "text": q["text"],
                "section": s_id,
                "type": q["type"],
                "options": q["options"],
                "order": idx + 1
            })
    
    print("SDF Seeding Complete!")

if __name__ == "__main__":
    seed_sdf()
