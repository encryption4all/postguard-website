import type { FriendlySender } from '@e4a/pg-js'

/** A non-email signed attribute prepared for rendering on the download
 *  page: `labelKey` is the svelte-i18n key for the human-readable label
 *  and `value` is the disclosed attribute value. The email is rendered
 *  separately (it is the public signing identity and always present),
 *  so it is filtered out here. */
export interface VerifiedAttribute {
    type: string
    labelKey: string
    value: string
}

export function verifiedAttributesFor(
    sender: FriendlySender | null | undefined
): VerifiedAttribute[] {
    if (!sender) return []
    return sender.attributes
        .filter((a) => !a.type.includes('email') && !!a.value)
        .map((a) => ({
            type: a.type,
            labelKey: `filesharing.attributes.${a.type}`,
            value: a.value as string,
        }))
}
