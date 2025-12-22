import '$lib/i18n'
import { locale, waitLocale } from 'svelte-i18n'
import { browser } from '$app/environment'

set()

async function set(){
    if (browser) {
        locale.set(window.navigator.language)
    }
    await waitLocale()
}