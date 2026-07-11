import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

// Regression test for issue encryption4all/postguard-website#297.
//
// The QR code shown in the decrypt/scan flow gained a "how to scan" block
// (rendered by the shared YiviQRCode component when `showInstructions` is set).
// Those steps must exist in *every* locale — a missing key silently falls back
// to the English default and reads as an untranslated string to Dutch users.
//
// The QR itself is rendered by pg-js against a live PostGuard session, so it
// cannot be exercised in the static preview build; this pins the shipped copy
// instead, which is the part that regresses in practice (partial translations).

const localesDir = fileURLToPath(new URL('../src/lib/locales', import.meta.url))

const LOCALES = ['en', 'nl'] as const
const SCAN_KEYS = ['heading', 'step1', 'step2', 'step3'] as const

for (const locale of LOCALES) {
    test(`${locale}.json defines all yivi.scan instruction strings`, () => {
        const bundle = JSON.parse(
            readFileSync(`${localesDir}/${locale}.json`, 'utf8')
        )
        const scan = bundle?.yivi?.scan
        expect(scan, `${locale}.json is missing yivi.scan`).toBeTruthy()

        for (const key of SCAN_KEYS) {
            expect(
                typeof scan[key] === 'string' && scan[key].trim().length > 0,
                `${locale}.json yivi.scan.${key} must be a non-empty string`
            ).toBe(true)
        }
    })
}

test('the scan instruction steps are enabled on the decrypt flows', () => {
    // The component keeps `showInstructions` off by default; the recipient
    // decrypt/scan flows (#297) must opt in, otherwise the guidance never shows.
    const read = (rel: string) =>
        readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')

    for (const rel of [
        '../src/routes/(app)/download/+page.svelte',
        '../src/lib/components/fallback/Decrypt.svelte',
    ]) {
        expect(read(rel), `${rel} should enable showInstructions`).toContain(
            'showInstructions'
        )
    }
})
