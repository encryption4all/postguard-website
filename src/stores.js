import { writable } from 'svelte/store'

// The current slide.
export const selected = writable(1)

// The iframe element. Used for sending messages about locale changes.
export const cryptifyIframe = writable()
