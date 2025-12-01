import { writable } from 'svelte/store'

// The current slide.
export const selected = writable(1)
