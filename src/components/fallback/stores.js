import { derived, writable, get } from 'svelte/store'
import { browser } from '$app/environment'

export const currSelected = writable(-1)

export const boolCacheEmail = writable(
    browser && JSON.parse(localStorage.getItem('boolCacheEmail') || 'true')
)

boolCacheEmail.subscribe(
    (val) => browser && (localStorage.boolCacheEmail = JSON.stringify(val))
)

export const boolCacheYivi = writable(
    browser && JSON.parse(localStorage.getItem('boolCacheYivi') || 'true')
)

boolCacheYivi.subscribe(
    (val) => browser && (localStorage.boolCacheYivi = JSON.stringify(val))
)

const storeKrCache = []

export const krCache = writable(
    browser &&
        JSON.parse(
            (get(boolCacheYivi) && localStorage.getItem('krCache')) ||
                JSON.stringify(storeKrCache)
        )
)

// Keep localStorage in sync if boolCacheYivi is true
krCache.subscribe(
    (val) =>
        browser &&
        get(boolCacheYivi) &&
        (localStorage.krCache = JSON.stringify(val))
)

const storeEmails = [
    // {
    //   id: 0,
    //   from: '',
    //   to: '',
    //   date: '',
    //   subject: '',
    //   raw: ''
    // }
]

export const emails = writable(
    browser &&
        JSON.parse(
            (get(boolCacheEmail) && localStorage.getItem('emails')) ||
                JSON.stringify(storeEmails)
        )
)

// Keep localStorage in sync if boolCacheEmail is true
emails.subscribe(
    (val) =>
        browser &&
        get(boolCacheEmail) &&
        (localStorage.emails = JSON.stringify(val))
)

export const currentId = derived(emails, ($emails) =>
    $emails
        ? $emails.reduce((prev, next) => (next.id > prev ? next.id : prev), -1)
        : -1
)

export const nextId = derived(currentId, ($currentId) => $currentId + 1)
