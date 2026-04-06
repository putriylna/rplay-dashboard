import { edenTreaty } from '@elysiajs/eden'
import type { App } from '../types/api-schema' 

export const api = edenTreaty<App>('https://k0edfk-ip-182-8-195-136.tunnelmole.net/', {
    fetcher: (url, options) => {
        // 1. Ambil token dari localStorage (hanya jika di browser)
        let token = null;
        if (typeof window !== 'undefined') {
            token = localStorage.getItem('admin_token');
        }

        return fetch(url, {
            ...options,
            headers: {
                ...options?.headers,
                "Accept": "application/json",
                "Content-Type": "application/json",
                // 2. Sematkan Bearer Token jika ada
                ...(token ? { "Authorization": `Bearer ${token}` } : {}),
            },
        })
    }
})