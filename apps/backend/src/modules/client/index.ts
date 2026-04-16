export class HTTPClient {
    constructor(private baseURL: string, private defaultHeaders: Record<string, string> = {}) {
        this.defaultHeaders = {
            "Content-Type": "application/json",
            ...defaultHeaders
        }
    }

    setHeaders(headers: Record<string, string>): void {
        this.defaultHeaders = headers;
    }

    private async parseResponse(response: Response) {
        const contentType = response.headers.get("Content-Type");
        if (contentType?.includes("application/json")) return response.json();
        return {};
    }

    async get(path: string, options?: RequestInit) {
        const { headers: extraHeaders, ...restOptions } = options ?? {};
        const response = await fetch(`${this.baseURL}${path}`, {
            method: "GET",
            headers: {
                ...this.defaultHeaders,
                ...(extraHeaders as Record<string, string>),
            },
            ...restOptions,
        });
        return this.parseResponse(response);
    }

    async post(path: string, body: any, options?: RequestInit) {
        const { headers: extraHeaders, ...restOptions } = options ?? {};
        const response = await fetch(`${this.baseURL}${path}`, {
            method: "POST",
            headers: {
                ...this.defaultHeaders,
                ...(extraHeaders as Record<string, string>),  // мержим заголовки
            },
            body: JSON.stringify(body),
            ...restOptions,
        });
        return this.parseResponse(response);
    }
}