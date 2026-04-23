
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

def seed_processor():
    print("Seeding Data Processor Questions to Local Instance...")
    
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

    # 2. Section Data for Data Processor
    processor_sections = [
        {
            "title": "Applicability & Role Clarity (Processor)",
            "order": 20,
            "target_select": "Data Processor",
            "questions": [
                {"text": "Is there a maintained register of all client-specific processing activities mapped to written fiduciary instructions?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are internal teams prohibited from repurposing fiduciary data for analytics, AI training, or internal improvements without authorization?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are conflicts between fiduciary instructions and internal policies escalated to compliance/legal before execution?", "type": "Scale 1-5", "options": "[]"},
                {"text": "How is independent purpose determination prevented?", "type": "Multiple Choice", "options": json.dumps(["A. System-level configuration restriction", "B. Compliance oversight review", "C. Business team discretion", "D. Not formally prevented"])}
            ]
        },
        {
            "title": "Consent & Notice (Processor)",
            "order": 21,
            "target_select": "Data Processor",
            "questions": [
                {"text": "If acting as a white-label platform, are fiduciary-specific notices dynamically configured per client?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are notice updates implemented only after documented fiduciary approval?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are consent logs preserved in original form and not modified by Processor systems?", "type": "Scale 1-5", "options": "[]"},
                {"text": "If consent is withdrawn, how does the Processor respond?", "type": "Multiple Choice", "options": json.dumps(["A. Immediate processing suspension + fiduciary notification", "B. Continue until fiduciary confirms", "C. Manual review", "D. No defined protocol"])}
            ]
        },
        {
            "title": "Data Lifecycle & Retention (Processor)",
            "order": 22,
            "target_select": "Data Processor",
            "questions": [
                {"text": "Is client data encrypted both at rest and in transit across all environments?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are logical and physical segregation controls implemented between client datasets?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are temporary processing files automatically purged after use?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Upon contract termination, how is data deletion validated internally?", "type": "Multiple Choice", "options": json.dumps(["A. Automated deletion workflow + audit log", "B. Manual deletion confirmation", "C. Vendor assurance only", "D. Not validated"])}
            ]
        },
        {
            "title": "Data Security & Breach Response (Processor)",
            "order": 23,
            "target_select": "Data Processor",
            "questions": [
                {"text": "Are fiduciary-specific breach notification timelines codified in internal incident response playbooks?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is a root cause analysis performed for every breach affecting client data?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are breach simulations conducted including fiduciary communication scenarios?", "type": "Scale 1-5", "options": "[]"},
                {"text": "How is client-specific data exposure quantified during incidents?", "type": "Multiple Choice", "options": json.dumps(["A. Structured data impact matrix", "B. Technical estimation only", "C. Client-driven inquiry", "D. No defined approach"])}
            ]
        },
        {
            "title": "Children’s Data (Processor)",
            "order": 24,
            "target_select": "Data Processor",
            "applicability_trigger": "process_children_data",
            "questions": [
                {"text": "Are children’s data processing rules configured separately per fiduciary instruction?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are safeguards preventing unauthorized analytics or algorithm training using children’s data enforced at system level?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are children’s data access privileges restricted to limited roles?", "type": "Scale 1-5", "options": "[]"},
                {"text": "If instructed to process children’s data without adequate consent proof, what is the response?", "type": "Multiple Choice", "options": json.dumps(["A. Escalate and suspend processing", "B. Seek clarification but continue processing", "C. Execute as instructed", "D. No defined process"])}
            ]
        },
        {
            "title": "Rights of Data Principals (Processor)",
            "order": 25,
            "target_select": "Data Processor",
            "questions": [
                {"text": "Is there a documented SLA to support fiduciary rights fulfillment requests?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are internal logs maintained to evidence execution of fiduciary instructions for rights requests?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are correction/erasure instructions technically enforced across analytics, backups, and archives?", "type": "Scale 1-5", "options": "[]"},
                {"text": "If a Data Principal directly contacts the Processor, what is the standard action?", "type": "Multiple Choice", "options": json.dumps(["A. Redirect immediately to fiduciary + log event", "B. Respond after informal internal review", "C. Provide limited information", "D. No defined policy"])}
            ]
        },
        {
            "title": "Governance & Accountability (Processor)",
            "order": 26,
            "target_select": "Data Processor",
            "questions": [
                {"text": "Are sub-processors required to maintain equivalent security and compliance certifications?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is there a centralized inventory of all sub-processors and their processing roles?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are periodic sub-processor performance/compliance reviews conducted?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is DPDP compliance included in client reporting dashboards or contractual performance reviews?", "type": "Multiple Choice", "options": json.dumps(["A. Yes, structured reporting", "B. Provided on request", "C. Informal updates", "D. Not included"])}
            ]
        },
        {
            "title": "Cross-Border Data Transfers (Processor)",
            "order": 27,
            "target_select": "Data Processor",
            "applicability_trigger": "cross_border_transfer",
            "questions": [
                {"text": "Are overseas hosting locations contractually locked and change-controlled?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are transfer logs available for fiduciary inspection?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are foreign access credentials periodically rotated and audited?", "type": "Scale 1-5", "options": "[]"},
                {"text": "If a law restricts a jurisdiction, what is the protocol?", "type": "Multiple Choice", "options": json.dumps(["A. Immediate suspension + migration plan", "B. Await fiduciary instruction", "C. Continue operations", "D. No defined response"])}
            ]
        }
    ]

    for s in processor_sections:
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
            rq = requests.get(url, headers=HEADERS, params=params)
            if rq.json().get("data", []):
                continue

            frappe_post("Question_dpdp", {
                "text": q["text"],
                "section": s_id,
                "type": q["type"],
                "options": q["options"],
                "order": idx + 1
            })
    
    print("Data Processor Seeding Complete!")

if __name__ == "__main__":
    seed_processor()
