import { writable } from 'svelte/store'
import { browser } from '$app/environment'

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

const storeKrCache = []

export const krCache = writable(
    browser &&
        JSON.parse(
            localStorage.getItem('krCache') || JSON.stringify(storeKrCache)
        )
)

krCache.subscribe(
    (val) => browser && (localStorage.jwtcache = JSON.stringify(val))
)

export const boolCacheEmail = writable(
    browser && JSON.parse(localStorage.getItem('boolCacheEmail') || 'false')
)

boolCacheEmail.subscribe(
    (val) => browser && (localStorage.boolCacheEmail = JSON.stringify(val))
)

export const boolCacheIRMA = writable(
    browser && JSON.parse(localStorage.getItem('boolCacheIRMA') || 'false')
)

boolCacheIRMA.subscribe(
    (val) => browser && (localStorage.boolCacheIRMA = JSON.stringify(val))
)
