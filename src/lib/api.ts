import { edenTreaty } from '@elysiajs/eden'
import type { App } from '../types/api-schema' 

export const api = edenTreaty<App>('https://lyqahx-ip-182-8-194-144.tunnelmole.net/', {
    fetcher: (url, options) => {
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
                ...(token ? { "Authorization": `Bearer ${token}` } : {}),
            },
        })
    }
})