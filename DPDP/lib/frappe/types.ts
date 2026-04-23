export interface FrappeDoc {
    name: string;
    owner: string;
    creation: string;
    modified: string;
    docstatus: 0 | 1 | 2; // 0: Draft, 1: Submitted, 2: Cancelled
}

export interface FrappeResponse<T> {
    message?: T;
    data?: T;
    docs?: T[];
}

export interface Organization_dpdp extends FrappeDoc {
    organization_name: string; // Mapped from 'name'
    industry: string;
    geography: string;
}

// Organization_dpdp already done

export interface Assessment_dpdp extends FrappeDoc {
    organization: string; // Link to Organization_dpdp
    version: string; // Link to Questionnaire_Version_dpdp
    status: 'Draft' | 'Submitted' | 'Evaluated';
    flag_childrendata: 0 | 1;
    flag_crossborder: 0 | 1;
    flag_roleclassification: string;
    overall_score: number;
    overall_grade: string;
    risk_tag: string;
}

export interface Question_dpdp extends FrappeDoc {
    section_link: string; // Link to Section_dpdp
    text: string;
    type: 'Yes/No' | 'Scale' | 'Factual' | 'Text';
    weight: number;
    order: number;
    meta_info: string;
}

export interface Section_dpdp extends FrappeDoc {
    title: string;
    description: string;
    weight: number;
    order: number;
}

export interface AssessmentResponse_dpdp extends FrappeDoc {
    parent1: string; // Link to Assessment_dpdp (Renamed from parent due to restrictions)
    parenttype: 'Assessment_dpdp'; // Keep or remove depending on if it's strictly a child table
    // Frappe standalone links don't strictly need parenttype/parentfield unless they are actual Child Tables.
    // If it's a standalone DocType with a link, just the link field is enough.

    question: string; // Link to Question_dpdp
    value_scale: number;
    value_factual: string;
    note: string;
}
