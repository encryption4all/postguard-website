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

/** A sender that disclosed nothing beyond an email address is a "weak"
 *  identity claim — anyone who controls the mailbox could have signed.
 *  The download-page trust gate uses this to escalate the warning.
 *  A missing sender is also weak: if the file was not signed at all,
 *  the recipient has no verified claim to act on. */
export function isWeakSenderIdentity(
    sender: FriendlySender | null | undefined
): boolean {
    return verifiedAttributesFor(sender).length === 0
}
