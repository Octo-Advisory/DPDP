
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

def seed_fiduciary():
    print("Seeding Data Fiduciary Questions to Local Instance...")
    
    # 1. Get current version (using the one from Discovery)
    version_label = "DPDP v2.2 - Discovery"
    url = f"{BASE_URL}/api/resource/Questionnaire_Version_dpdp"
    params = {"filters": json.dumps([["version_id", "=", version_label]])}
    r = requests.get(url, headers=HEADERS, params=params)
    existing = r.json().get("data", [])
    if existing:
        v_id = existing[0]["name"]
        print(f"Adding to version: {v_id}")
    else: 
        print("Aborting: Version not found. Run seed_local.py first.")
        return

    # 2. Section Data
    fiduciary_sections = [
        {
            "title": "Applicability & Role Clarity",
            "order": 10,
            "target_select": "Data Fiduciary",
            "questions": [
                {"text": "Is there a centralized inventory of all systems/applications that process personal data?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are shadow IT systems periodically identified and brought under compliance review?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are joint-controller or co-fiduciary arrangements formally documented where applicable?", "type": "Scale 1-5", "options": "[]"},
                {"text": "How are new vendors classified before onboarding?", "type": "Multiple Choice", "options": json.dumps(["A. Risk-based assessment with DPDP screening", "B. Standard vendor checklist", "C. Commercial review only", "D. No defined classification"])}
            ]
        },
        {
            "title": "Consent & Notice",
            "order": 11,
            "target_select": "Data Fiduciary",
            "questions": [
                {"text": "Are consent capture flows version-controlled with archival of previous notice versions?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is granular purpose tagging implemented at database level to prevent misuse beyond consented purpose?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are offline consent mechanisms (paper forms, in-store forms) digitized and auditable?", "type": "Scale 1-5", "options": "[]"},
                {"text": "If bundled consent is unavoidable for operational reasons, is legal justification documented?", "type": "Multiple Choice", "options": json.dumps(["A. Yes, formally documented", "B. Informally justified", "C. No documentation", "D. Not reviewed"])}
            ]
        },
        {
            "title": "Data Lifecycle & Retention",
            "order": 12,
            "target_select": "Data Fiduciary",
            "questions": [
                {"text": "Are data flows mapped from collection to deletion, including third-party sharing?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are test environments and staging databases included in retention enforcement?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is anonymization quality periodically tested to ensure irreversibility?", "type": "Scale 1-5", "options": "[]"},
                {"text": "How is legacy data handled?", "type": "Multiple Choice", "options": json.dumps(["A. Migration with retention controls applied", "B. Archived without review", "C. Retained indefinitely", "D. Not assessed"])}
            ]
        },
        {
            "title": "Data Security & Breach Response",
            "order": 13,
            "target_select": "Data Fiduciary",
            "questions": [
                {"text": "Are encryption keys managed separately from data storage environments?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is there documented breach severity classification criteria?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are third-party breach notifications contractually time-bound?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are penetration tests conducted for systems processing personal data?", "type": "Multiple Choice", "options": json.dumps(["A. Annually or more", "B. Every 2–3 years", "C. Ad-hoc", "D. Never"])}
            ]
        },
        {
            "title": "Children’s Data",
            "order": 14,
            "target_select": "Data Fiduciary",
            "applicability_trigger": "process_children_data",
            "questions": [
                {"text": "Are parental consent records independently verifiable and retrievable?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are child accounts periodically revalidated upon reaching age of majority?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is targeted advertising technically restricted for child profiles?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are parental withdrawal requests handled with priority escalation?", "type": "Multiple Choice", "options": json.dumps(["A. Defined SLA with escalation", "B. Standard SLA", "C. Informal handling", "D. Not defined"])}
            ]
        },
        {
            "title": "Rights of Data Principals",
            "order": 15,
            "target_select": "Data Fiduciary",
            "questions": [
                {"text": "Are identity verification methods proportionate to risk level of the request?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are request rejection patterns reviewed for bias or systemic denial?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is there a maximum cap defined for request fulfillment timelines?", "type": "Multiple Choice", "options": json.dumps(["A. Yes, documented SLA", "B. Informal expectation", "C. Case-by-case", "D. Not defined"])},
                {"text": "Are third-party processors contractually obligated to support rights fulfillment timelines?", "type": "Scale 1-5", "options": "[]"}
            ]
        },
        {
            "title": "Governance & Accountability",
            "order": 16,
            "target_select": "Data Fiduciary",
            "questions": [
                {"text": "Is DPDP compliance embedded into internal audit scope annually?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are privacy KPIs reported to senior leadership periodically?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are non-compliance incidents tracked in risk registers?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is employee disciplinary action defined for privacy violations?", "type": "Multiple Choice", "options": json.dumps(["A. Formal documented policy", "B. Case-based handling", "C. Informal response", "D. Not defined"])}
            ]
        },
        {
            "title": "Cross-Border Data Transfers",
            "order": 17,
            "target_select": "Data Fiduciary",
            "applicability_trigger": "cross_border_transfer",
            "questions": [
                {"text": "Is a live register maintained of all jurisdictions where personal data is stored or accessed?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are cross-border transfers subject to prior compliance/legal review?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Are foreign vendor access logs periodically audited?", "type": "Scale 1-5", "options": "[]"},
                {"text": "Is there a documented contingency plan if a jurisdiction becomes restricted by Government notification?", "type": "Multiple Choice", "options": json.dumps(["A. Defined exit/migration strategy", "B. Vendor-dependent approach", "C. No contingency plan", "D. Not assessed"])}
            ]
        }
    ]

    for s in fiduciary_sections:
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
    
    print("Data Fiduciary Seeding Complete!")

if __name__ == "__main__":
    seed_fiduciary()
