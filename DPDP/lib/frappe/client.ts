const CSRF_PLACEHOLDER = '{{ frappe.session.csrf_token }}';

const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        // In browser, use relative path (empty string) to avoid //api protocol-relative URL issues
        return '';
    }
    return process.env.NEXT_PUBLIC_FRAPPE_URL || 'http://64.227.187.13:82//';
};

const FRAPPE_URL = getBaseUrl();

export class FrappeClient {
    private cookie: string;
    private csrfToken: string | null | undefined;

    constructor(cookie?: string) {
        this.cookie = cookie || '';
        this.csrfToken = undefined;
    }

    private isPlaceholderToken(token: any): boolean {
        return token === CSRF_PLACEHOLDER || token === '{{ csrf_token }}';
    }

    private isValidCsrfToken(token: any): token is string {
        return typeof token === 'string' && token.length > 0 && !this.isPlaceholderToken(token);
    }

    private async loadCsrfToken(): Promise<string | undefined> {
        if (typeof window === 'undefined') {
            return undefined;
        }

        if (this.isValidCsrfToken(this.csrfToken)) {
            return this.csrfToken;
        }

        let token = (window as any).csrf_token;
        if (this.isValidCsrfToken(token)) {
            this.csrfToken = token;
            return token;
        }

        try {
            const response = await fetch('/api/method/dpdp_compliance.www.DPDP.get_csrf_token', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const body = await response.json();
                token = body.message;
                if (this.isValidCsrfToken(token)) {
                    this.csrfToken = token;
                    (window as any).csrf_token = token;
                    return token;
                }
            }
        } catch (error) {
            console.warn('Unable to load CSRF token:', error);
        }

        return undefined;
    }

    private async getHeaders(): Promise<Record<string, string>> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };

        if (typeof window !== 'undefined') {
            const token = await this.loadCsrfToken();
            if (this.isValidCsrfToken(token)) {
                headers['X-Frappe-CSRF-Token'] = token;
            }
        }

        if (this.cookie && typeof window === 'undefined') {
            headers.Cookie = this.cookie;
        }

        return headers;
    }

    async call<T = any>(method: string, data?: any): Promise<T> {
        const url = `${FRAPPE_URL}/api/method/${method}`;
        const options: RequestInit = {
            method: 'POST',
            headers: await this.getHeaders(),
            credentials: 'include',
            body: data ? JSON.stringify(data) : undefined,
        };

        const res = await fetch(url, options);
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Frappe API Error (${res.status}): ${errorText}`);
        }

        const json = await res.json();
        return json.message || json.data;
    }

    async getDoc<T = any>(doctype: string, name: string): Promise<T> {
        const url = `${FRAPPE_URL}/api/resource/${doctype}/${name}`;
        const res = await fetch(url, {
            method: 'GET',
            headers: await this.getHeaders(),
            credentials: 'include',
        });

        if (!res.ok) {
            if (res.status === 404) throw new Error(`${doctype} ${name} not found`);
            throw new Error(`Failed to fetch ${doctype}: ${res.statusText}`);
        }

        const json = await res.json();
        return json.data;
    }

    async getList<T = any>(doctype: string, filters?: any[][], fields: string[] = ['*'], limit: number = 20): Promise<T[]> {
        const params = new URLSearchParams();
        // params.append('doctype', doctype); // Removed: redundant for REST API resource endpoint
        params.append('fields', JSON.stringify(fields));
        if (filters) {
            params.append('filters', JSON.stringify(filters));
        }
        params.append('limit_page_length', limit.toString());

        const url = `${FRAPPE_URL}/api/resource/${doctype}?${params.toString()}`;
        const res = await fetch(url, {
            method: 'GET',
            headers: await this.getHeaders(),
            credentials: 'include',
        });

        if (!res.ok) {
            const err = await res.text();
            console.error(`Failed to list ${doctype}. Status: ${res.status}. Response: ${err}`);
            throw new Error(`Failed to list ${doctype}: ${err}`);
        }
        const json = await res.json();
        return json.data;
    }

    async createDoc<T = any>(doctype: string, data: any): Promise<T> {
        const url = `${FRAPPE_URL}/api/resource/${doctype}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: await this.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.exception || 'Failed to create doc');
        }

        const json = await res.json();
        return json.data;
    }

    async updateDoc<T = any>(doctype: string, name: string, data: any): Promise<T> {
        const url = `${FRAPPE_URL}/api/resource/${doctype}/${name}`;
        const res = await fetch(url, {
            method: 'PUT',
            headers: await this.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error('Failed to update doc');
        const json = await res.json();
        return json.data;
    }

    async deleteDoc(doctype: string, name: string): Promise<void> {
        const url = `${FRAPPE_URL}/api/resource/${doctype}/${name}`;
        const res = await fetch(url, {
            method: 'DELETE',
            headers: await this.getHeaders(),
            credentials: 'include',
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Failed to delete doc: ${err}`);
        }
    }
}
