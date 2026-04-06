import { edenTreaty } from '@elysiajs/eden'
import type { App } from '../types/api-schema' 

export const api = edenTreaty<App>('https://yl3ulb-ip-38-46-233-10.tunnelmole.net/', {
    fetcher: (url, options) => {
        return fetch(url, {
            ...options,
            headers: {
                ...options?.headers,
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        })
    }
})