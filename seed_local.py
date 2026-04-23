
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

def seed_discovery():
    print("Seeding Discovery Phase to Local Instance...")
    
    # 1. Create Version
    version_label = "DPDP v2.2 - Discovery"
    v_doc = frappe_post("Questionnaire_Version_dpdp", {
        "version_id": version_label,
        "active": 1,
        "description": "Seeded Discovery questions for role identification and applicability."
    })
    v_id = v_doc.get("data", {}).get("name")
    if not v_id:
        print(f"Warning: Failed to create version '{version_label}'. Checking if it exists...")
        url = f"{BASE_URL}/api/resource/Questionnaire_Version_dpdp"
        params = {"filters": json.dumps([["version_id", "=", version_label]])}
        r = requests.get(url, headers=HEADERS, params=params)
        existing = r.json().get("data", [])
        if existing:
            v_id = existing[0]["name"]
            print(f"Using existing version: {v_id}")
        else: 
            print("Aborting seed: version could not be found or created.")
            return

    # 2. Sections & Questions
    sections = [
        {
            "title": "Role Identification",
            "order": 1,
            "questions": [
                {
                    "text": "Which role best describes your organization in relation to personal data?",
                    "type": "Multiple Choice",
                    "options": json.dumps(["Data Fiduciary", "Data Processor", "Significant Data Fiduciary", "Not sure"]),
                    "order": 1,
                    "updates_role": 1
                }
            ]
        },
        {
            "title": "Role Clarification",
            "order": 2,
            "questions": [
                {
                    "text": "Does your organization decide why personal data is collected and how it is used?",
                    "type": "Multiple Choice",
                    "options": json.dumps(["A. Yes, we decide purpose and means", "B. We mainly act on another organization’s instructions", "C. Both, depending on the engagement", "D. Not sure"]),
                    "order": 1
                },
                {
                    "text": "Does your organization process personal data on behalf of another organization under contract or written instructions?",
                    "type": "Multiple Choice",
                    "options": json.dumps(["A. Yes, regularly", "B. Sometimes", "C. No", "D. Not sure"]),
                    "order": 2
                },
                {
                    "text": "Does your organization primarily provide services, platforms, hosting, analytics, or operational support using another organization’s data?",
                    "type": "Multiple Choice",
                    "options": json.dumps(["A. Yes", "B. Partly", "C. No", "D. Not sure"]),
                    "order": 3
                },
                {
                    "text": "Is your organization involved in large-scale or high-impact personal data processing that may require enhanced governance, DPIA, or DPO oversight?",
                    "type": "Multiple Choice",
                    "options": json.dumps(["A. Yes", "B. Possibly / under review", "C. No", "D. Not sure"]),
                    "order": 4
                }
            ]
        },
        {
            "title": "Applicability",
            "order": 3,
            "questions": [
                {
                    "text": "Does your organization collect, store, use, or otherwise process personal data of children?",
                    "type": "Multiple Choice",
                    "options": json.dumps(["A. Yes", "B. No"]),
                    "order": 1,
                    "updates_flag": "process_children_data"
                },
                {
                    "text": "Is personal data stored outside India, transferred outside India, or accessed from outside India?",
                    "type": "Multiple Choice",
                    "options": json.dumps(["A. Yes", "B. No"]),
                    "order": 2,
                    "updates_flag": "cross_border_transfer"
                }
            ]
        }
    ]

    for s in sections:
        # Check if section already exists in this version to avoid duplicates
        url = f"{BASE_URL}/api/resource/Section_dpdp"
        params = {"filters": json.dumps([["version", "=", v_id], ["title", "=", s["title"]]])}
        r = requests.get(url, headers=HEADERS, params=params)
        existing = r.json().get("data", [])
        
        if existing:
            print(f"Skipping existing Section: {s['title']}")
            continue

        print(f"Creating Section: {s['title']}")
        s_doc = frappe_post("Section_dpdp", {
            "title": s["title"],
            "version": v_id,
            "order": s["order"],
            "target_role": "None"
        })
        s_id = s_doc.get("data", {}).get("name")
        if not s_id: continue
        
        for q in s["questions"]:
            frappe_post("Question_dpdp", {
                "text": q["text"],
                "section": s_id,
                "type": q["type"],
                "options": q["options"],
                "order": q["order"],
                "updates_role": q.get("updates_role", 0),
                "updates_flag": q.get("updates_flag", "None")
            })
    
    print("Seed Discovery Complete on Local Instance!")

if __name__ == "__main__":
    seed_discovery()
