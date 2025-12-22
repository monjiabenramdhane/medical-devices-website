export const api = {
    get: async (endpoint: string) => {
        const res = await fetch(`/api${endpoint}`);
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },
    post: async (endpoint: string, data: any) => {
        const res = await fetch(`/api${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },
    put: async (endpoint: string, data: any) => {
        const res = await fetch(`/api${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },
    delete: async (endpoint: string) => {
        const res = await fetch(`/api${endpoint}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },
};
