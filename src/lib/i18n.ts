import { browser } from '$app/environment'
import { register, init, getLocaleFromNavigator } from 'svelte-i18n'

register('en-US', () => import('./locales/en.json'))
register('nl-NL', () => import('./locales/nl.json'))

const defaultLanguage = 'en-US'

init({
    fallbackLocale: defaultLanguage,
    initialLocale: browser
        ? localStorage.getItem('preferredLanguage')
        : defaultLanguage,
})
