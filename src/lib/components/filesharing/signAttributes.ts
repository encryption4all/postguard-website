import type { AttrConItem } from '@e4a/pg-js'

/**
 * Yivi attributes the sender may optionally disclose when signing a
 * PostGuard file share. The PostGuard PKG prepends the mandatory email
 * attribute, so it's not listed here. Everything here is optional — the
 * sender only needs to prove their email address.
 */
export const SIGN_ATTRIBUTES: AttrConItem[] = [
    { t: 'pbdf.sidn-pbdf.mobilenumber.mobilenumber', optional: true },
    { t: 'pbdf.gemeente.personalData.dateofbirth', optional: true },
]
