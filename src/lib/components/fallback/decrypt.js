// sort the recipient credentials on alphabetical order
export function sortPolicies(con) {
    const sorted = con.sort(
        (att1, att2) =>
            att1.t.localeCompare(att2.t) || att1.v.localeCompare(att2.v)
    )
    return sorted
}

export function secondsTill4AM() {
    const now = Date.now()
    const nextMidnight = new Date(now).setHours(24, 0, 0, 0)
    const secondsTillMidnight = Math.round((nextMidnight - now) / 1000)
    const secondsTill4AM = secondsTillMidnight + 4 * 60 * 60
    return secondsTill4AM % (24 * 60 * 60)
}

// from: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
export async function digestMessage(message) {
    const msgUint8 = new TextEncoder().encode(message) // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8) // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('') // convert bytes to hex string
    return hashHex
}
