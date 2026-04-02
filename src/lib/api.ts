import { edenTreaty } from '@elysiajs/eden'
import type { App } from '../types/api-schema' 

export const api = edenTreaty<App>('https://ahoglo-ip-182-8-195-119.tunnelmole.net/', {
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