import { derived, writable } from 'svelte/store'
import { browser } from '$app/environment'

export const currSelected = writable(-1)

const storeKrCache = []

export const krCache = writable(
    browser &&
        JSON.parse(
            localStorage.getItem('krCache') || JSON.stringify(storeKrCache)
        )
)

krCache.subscribe(
    (val) => browser && (localStorage.krCache = JSON.stringify(val))
)

export const boolCacheEmail = writable(
    browser && JSON.parse(localStorage.getItem('boolCacheEmail') || 'false')
)

boolCacheEmail.subscribe(
    (val) => browser && (localStorage.boolCacheEmail = JSON.stringify(val))
)

export const boolCacheYivi = writable(
    browser && JSON.parse(localStorage.getItem('boolCacheYivi') || 'false')
)

boolCacheYivi.subscribe(
    (val) => browser && (localStorage.boolCacheYivi = JSON.stringify(val))
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
            localStorage.getItem('emails') || JSON.stringify(storeEmails)
        )
)

emails.subscribe(
    (val) => browser && (localStorage.emails = JSON.stringify(val))
)

export const currentId = derived(emails, ($emails) =>
    $emails? $emails.reduce((prev, next) => (next.id > prev ? next.id : prev), -1) : -1
)

export const nextId = derived(currentId, ($currentId) => $currentId + 1)
