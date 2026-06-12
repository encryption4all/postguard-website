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

/** A sender that verified an email address but disclosed nothing beyond
 *  it is a "weak" identity claim — anyone who controls the mailbox could
 *  have signed. The download-page trust gate uses this to escalate the
 *  warning. A missing sender (an unsigned file) is not "weak email-only":
 *  there is no email to caveat, so the email-only warning does not apply. */
export function isWeakSenderIdentity(
    sender: FriendlySender | null | undefined
): boolean {
    return !!sender?.email && verifiedAttributesFor(sender).length === 0
}

/** A file with no verifiable sender at all: it was not signed, or the
 *  signature carries no email (the public signing identity). This is the
 *  weakest case — there is no identity claim to evaluate — so the download
 *  gate shows the strongest warning and time-locks the download button. */
export function isUnsignedSender(
    sender: FriendlySender | null | undefined
): boolean {
    return !sender?.email
}
