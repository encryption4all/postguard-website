import { browser } from '$app/environment'
import { redirect } from '@sveltejs/kit'
import { hasVisited } from '$lib/visitedCookie'

export function load() {
    // Only redirect returning visitors on direct/external navigation (full page load),
    // not on client-side navigations (e.g. clicking "Home" in the navbar).
    if (
        browser &&
        !(/** @type {any} */ (window).__pg_client_nav) &&
        hasVisited()
    ) {
        redirect(302, '/fileshare')
    }
}
