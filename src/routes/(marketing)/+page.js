import { browser } from '$app/environment'
import { redirect } from '@sveltejs/kit'

export function load() {
    if (browser && localStorage.getItem('pg_visited')) {
        redirect(302, '/fileshare')
    }
}
