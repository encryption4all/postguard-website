import type { AttributeCon } from '@e4a/pg-wasm'
import YiviCore from '@privacybydesign/yivi-core'
import YiviWeb from '@privacybydesign/yivi-web'
import YiviClient from '@privacybydesign/yivi-client'
import { browser } from '$app/environment'

async function RetrieveSignKeys(pub: AttributeCon, priv?: AttributeCon, showQR: boolean = true): Promise<any> {
    if (!browser) return
    let PKG_URL = import.meta.env.VITE_PKG_URL

    const session = {
        start: {
            url:() => `${PKG_URL}/v2/request/start`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ con: [...pub, ...(priv ? priv : [])] }),
        },
        result: {
            url: (o,{ sessionToken }) => `${PKG_URL}/v2/request/jwt/${sessionToken}`,            parseResponse: (r) => {
                return r
                    .text()
                    .then((jwt) =>
                        fetch(`${PKG_URL}/v2/irma/sign/key`, {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${jwt}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                pubSignId: pub,
                                ...(priv && { privSignId: priv }),
                            }),
                        }),
                    )
                    .then((r) => r.json())
                    .then((json) => {
                        if (json.status !== 'DONE' || json.proofStatus !== 'VALID')
                            throw new Error('not done and valid')
                        return {
                            pubSignKey: json.pubSignKey,
                            ...(priv && {
                                privSignKey: json.privSignKey,
                            }),
                        }
                    })
                    .catch((e: Error) => console.log('error: ', e))
            },
        },
    }
    let selectedLang: String = localStorage.getItem('preferredLanguage') ?? 'en'
    // strip the bit after the dash to get 'en' from 'en-US'
    if (selectedLang.includes('-')) {
        selectedLang = selectedLang.split('-')[0]
    }

    const yiviConfig: any = {
        debugging: false,
        session,
        state: {
            serverSentEvents: false,
            polling: {
                endpoint: 'status',
                interval: 500,
                startState: 'INITIALIZED',
            },
        },
        language: selectedLang.toLowerCase(),
    }

    // Always use YiviWeb: it handles QR rendering on desktop
    // and deep link generation on mobile.
    yiviConfig.element = '#crypt-irma-qr'

    const yivi = new YiviCore(yiviConfig)

    // sleep for half a second to allow the DOM to update
    await new Promise((resolve) => setTimeout(resolve, 500))

    yivi.use(YiviWeb)
    yivi.use(YiviClient)

    return await yivi
        .start()
        .catch((e: Error) => console.error('failed IRMA session: ', e))
}

export { RetrieveSignKeys }