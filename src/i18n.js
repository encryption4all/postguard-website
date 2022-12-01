import { register, init, getLocaleFromNavigator } from 'svelte-i18n'
import { browser } from "$app/environment";

register('en-US', () => import('./locales/en.json'))
register('nl-NL', () => import('./locales/nl.json'))

init({
    fallbackLocale: 'en-US',
    initialLocale: browser ? localStorage.getItem('preferredLanguage') : getLocaleFromNavigator(),
})
