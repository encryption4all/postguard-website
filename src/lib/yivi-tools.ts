import type { AttributeCon } from '@e4a/pg-wasm'
import YiviCore from '@privacybydesign/yivi-core'
import YiviWeb from '@privacybydesign/yivi-web'
import YiviClient from '@privacybydesign/yivi-client'
import { browser } from '$app/environment'

async function RetrieveSignKeys(pub: AttributeCon, priv?: AttributeCon): Promise<any> {
    if (!browser) return;
    let PKG_URL = import.meta.env.VITE_MAX_UPLOAD_SIZE

    const session = {
        start: {
            url: `${PKG_URL}/v2/request/start`,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ con: [...pub, ...(priv ? priv : [])] }),
        },
        result: {
            url: ({ sessionToken }) => `${PKG_URL}/v2/request/jwt/${sessionToken}`,
            parseResponse: (r) => {
                return r
                    .text()
                    .then((jwt) =>
                        fetch(`${PKG_URL}/v2/irma/sign/key`, {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${jwt}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                pubSignId: pub,
                                ...(priv && { privSignId: priv }),
                            }),
                        })
                    )
                    .then((r) => r.json())
                    .then((json) => {
                        if (json.status !== "DONE" || json.proofStatus !== "VALID")
                            throw new Error("not done and valid");
                        return {
                            pubSignKey: json.pubSignKey,
                            ...(priv && {
                                privSignKey: json.privSignKey,
                            }),
                        };
                    })
                    .catch((e:Error) => console.log("error: ", e));
            },
        },
    };
    let selectedLang: String = localStorage.getItem('preferredLanguage') ?? 'en-US';

    const yivi = new YiviCore({
        debugging: false,
        element: ".crypt-irma-qr",
        session,
        state: {
            serverSentEvents: false,
            polling: {
                endpoint: "status",
                interval: 500,
                startState: "INITIALIZED",
            },
        },
        language: selectedLang.toLowerCase(),
    });

    yivi.use(YiviWeb);
    yivi.use(YiviClient);

    return await yivi
        .start()
        .catch((e:Error) => console.error("failed IRMA session: ", e));
}

export { RetrieveSignKeys };