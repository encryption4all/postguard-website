import type { AttrConItem } from '@e4a/pg-js'

/**
 * Yivi attributes the sender must (or may) disclose when signing a
 * PostGuard file share. The PostGuard PKG prepends the email attribute,
 * so it's not listed here.
 *
 * The first entry is the **mandatory name disjunction** — the sender
 * proves their name from any one of four credentials:
 *
 *   - `pbdf.gemeente.personalData.fullname` (Dutch municipality), OR
 *   - `pbdf.pbdf.passport.{firstName,lastName}`, OR
 *   - `pbdf.pbdf.idcard.{firstName,lastName}`, OR
 *   - `pbdf.pbdf.drivinglicence.{firstName,lastName}`.
 *
 * The remaining entries are unchanged optional extras from before
 * postguard#239 — kept in the legacy flat shape with `optional: true`.
 */
export const SIGN_ATTRIBUTES: AttrConItem[] = [
    [
        [{ t: 'pbdf.gemeente.personalData.fullname' }],
        [
            { t: 'pbdf.pbdf.passport.firstName' },
            { t: 'pbdf.pbdf.passport.lastName' },
        ],
        [
            { t: 'pbdf.pbdf.idcard.firstName' },
            { t: 'pbdf.pbdf.idcard.lastName' },
        ],
        [
            { t: 'pbdf.pbdf.drivinglicence.firstName' },
            { t: 'pbdf.pbdf.drivinglicence.lastName' },
        ],
    ],
    { t: 'pbdf.sidn-pbdf.mobilenumber.mobilenumber', optional: true },
    { t: 'pbdf.gemeente.personalData.dateofbirth', optional: true },
]
