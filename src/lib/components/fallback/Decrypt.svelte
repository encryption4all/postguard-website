<script>
    import { run } from 'svelte/legacy';

    import { tick, onMount } from 'svelte'

    // Yivi
    import { YiviCore } from '@privacybydesign/yivi-core'
    import { YiviClient } from '@privacybydesign/yivi-client'
    import { YiviWeb } from '@privacybydesign/yivi-web'
    import '@privacybydesign/yivi-css'

    import jwt_decode from 'jwt-decode'

    import {
        currSelected,
        currentId,
        nextId,
        boolCacheYivi,
        emails,
        krCache,
    } from './stores'

    import * as decrypt from './decrypt.js'
    import * as email from './email'

    import { locale, _ } from 'svelte-i18n'

    import YiviQRCode from '$lib/components/filesharing/YiviQRCode.svelte'
    import Chip from '$lib/components/Chip.svelte'

    const STATES = {
        Uninit: 'Uninit',
        Init: 'Init',
        Recipients: 'Recipients',
        Qr: 'Qr',
        Decrypting: 'Decrypting',
        Show: 'Show',
        Fail: 'Fail',
    }

    import { PKG_URL } from '$lib/env'

    let decryptState = $state(STATES.Uninit)

    let outStream = ''
    let decoder = new TextDecoder()
    const unsealerWritable = new WritableStream({
        write: (chunk) => {
            outStream += decoder.decode(chunk, { stream: true })
        },
        close: () => {
            outStream += decoder.decode()
        },
    })

    let policies = $state()
    let usk = $state()
    let keylist = $state()
    let key = $state()
    let keyRequest
    let recipientAndCreds
    let recipientStripped
    let timestamp

    let showHints = $state(false)
    let hints = $state([])

    let boolRecipientCached = $state()
    let jwtCached

    let krCacheTemp = {
        jwt: '',
        jwtValid: '',
        key: '',
        krCon: {},
    }

    let decryptedMail
    let err = $state()

    /** @type {{rightMode: any, mod: any, readable: any}} */
    let { rightMode = $bindable(), mod, readable } = $props();

    let unsealer = $state()
    let vk = $state()

    onMount(async () => {
        vk = await fetch(`${PKG_URL}/v2/sign/parameters`)
            .then((r) => r.json())
            .then((j) => j.publicKey)
    })

    function checkRecipients() {
        if (policies.size == 1) {
            key = policies.keys().next().value
            krCacheTemp.key = key
        } else {
            keylist = [...policies.keys()].filter((k) => k)
            decryptState = STATES.Recipients
        }
    }

    function processPolicy() {
        timestamp = policies.get(key).ts
        recipientAndCreds = decrypt.sortPolicies(policies.get(key)['con'])
        boolRecipientCached = checkKrCached()
    }

    function checkKrCached() {
        for (const kr of $krCache) {
            if (
                kr.key === key &&
                JSON.stringify(kr.krCon) === JSON.stringify(recipientAndCreds)
            ) {
                if (Date.now() / 1000 < kr.jwtValid) {
                    jwtCached = kr.jwt
                    return true
                } else {
                    $krCache = $krCache.filter((x) => x.exp != kr.exp)
                    break
                }
            }
        }
        return false
    }

    function processCredentials() {
        let pol = policies.get(key)['con']
        for (var i = 0; i < pol.length; i++) {
            if (pol[i]['t'] == 'pbdf.sidn-pbdf.mobilenumber.mobilenumber') {
                showHints = true
                hints.push('Mobile number: ' + pol[i]['v'])
            } else if (pol[i]['t'] == 'pbdf.pbdf.surfnet-2.id') {
                showHints = true
                hints.push('Student ID: ' + pol[i]['v'])
            }
        }
    }

    function cacheCredentials() {
        let jwtdecoded = /** @type {any} */ (jwt_decode(krCacheTemp.jwt))
        krCacheTemp.jwtValid = jwtdecoded.exp
        $krCache = [...$krCache, krCacheTemp]
    }

    function stripCredentials() {
        krCacheTemp.krCon = recipientAndCreds
        recipientStripped = JSON.parse(JSON.stringify(recipientAndCreds))
        for (const c of recipientStripped) {
            delete c.v
        }
    }

    function createKr() {
        keyRequest = {
            con: recipientStripped,
            validity: decrypt.secondsTill4AM(),
        }
    }

    async function getUskCachedJWT() {
        usk = await fetch(`${PKG_URL}/v2/request/key/${timestamp.toString()}`, {
            headers: {
                Authorization: `Bearer ${jwtCached}`,
            },
        }).then((r) => r.json().then((o) => o.key))
        return usk
    }

    async function getUsk() {
        const session = {
            url: PKG_URL,
            start: {
                url: (o) => `${o.url}/v2/request/start`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(keyRequest),
            },
            result: {
                url: (o, { sessionToken }) =>
                    `${o.url}/v2/request/jwt/${sessionToken}`,
                parseResponse: (r) => {
                    return r
                        .text()
                        .then((jwt) => {
                            krCacheTemp.jwt = jwt
                            return fetch(
                                `${PKG_URL}/v2/request/key/${timestamp.toString()}`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${jwt}`,
                                    },
                                }
                            )
                        })
                        .then((r) => r.json())
                        .then((json) => {
                            if (
                                json.status !== 'DONE' ||
                                json.proofStatus !== 'VALID'
                            )
                                throw new Error('not done and valid')
                            return json.key
                        })
                        .catch((e) => console.log('error: ', e))
                },
            },
        }

        const yivi = new YiviCore({
            language: $locale === 'nl-NL' ? 'nl' : 'en',
            debugging: true,
            session,
            element: '#yivi-fallback',
            translations: {
                header: $_('fallback.decrypt.helper'),
            },
        })

        yivi.use(YiviWeb)
        yivi.use(YiviClient)
        usk = await yivi.start()

        if ($boolCacheYivi) cacheCredentials()

        return usk
    }

    function retry() {
        err = undefined
        usk = undefined
        showHints = false
        hints = []
        decryptState = STATES.Qr
        tick().then(() => {
            getUsk().then((retrieved) => (usk = retrieved))
        }).catch((e) => {
            err = e
            decryptState = STATES.Fail
        })
    }

    async function decryptFile() {
        const ret = await unsealer.unseal(key, usk, unsealerWritable)
        decryptedMail = await email.parseMail(outStream)
        await storeMail(outStream)
    }

    async function storeMail(unparsed) {
        const hash = await decrypt.digestMessage(unparsed)
        const found = $emails.find((e) => e.hash === hash)
        if (found) {
            currSelected.set(found.id)
            await tick()
            rightMode = 'MailView'
            return
        }

        $emails = [
            {
                id: $nextId,
                from: decryptedMail.from,
                to: decryptedMail.to,
                date: decryptedMail.headers[0]['value'],
                subject: decryptedMail.subject,
                raw: unparsed,
                hash,
            },
            ...$emails,
        ]

        currSelected.set($currentId)
        await tick()
        rightMode = 'MailView'
    }

    run(() => {
        if (decryptState === STATES.Uninit && vk) {
            mod.StreamUnsealer.new(readable, vk)
                .then((u) => {
                    decryptState = STATES.Init
                    unsealer = u
                    policies = unsealer.inspect_header()
                    checkRecipients()
                })
                .catch((e) => {
                    err = e
                    decryptState = STATES.Fail
                })
        }
    });
    run(() => {
        if ((decryptState == STATES.Init || decryptState == STATES.Recipients) && key) {
            processPolicy()
            processCredentials()

            if (boolRecipientCached) {
                getUskCachedJWT()
                    .then((retrieved) => (usk = retrieved))
                    .catch((e) => {
                        err = e
                        decryptState = STATES.Fail
                    })
            } else {
                stripCredentials()
                createKr()
                decryptState = STATES.Qr
                tick()
                    .then(() => {
                        getUsk().then((retrieved) => (usk = retrieved))
                    })
                    .catch((e) => {
                        err = e
                        decryptState = STATES.Fail
                    })
            }
        }
    });
    run(() => {
        if (usk) {
            decryptState = STATES.Decrypting

            decryptFile()
                .then(() => (decryptState = STATES.Show))
                .catch((e) => {
                    err = e
                    decryptState = STATES.Fail
                })
        }
    });
</script>

<div class="decrypt-wrapper">
    {#if decryptState === STATES.Uninit || decryptState === STATES.Init}
        <div class="spinner-wrapper">
            <svg class="spinner" viewBox="0 0 24 24" width="36" height="36">
                <circle class="spinner-circle" cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3"></circle>
            </svg>
        </div>
        <p class="status-text">{$_('fallback.decrypt.init', { default: 'Initializing...' })}</p>

    {:else if decryptState === STATES.Recipients}
        <div class="decrypt-card">
            <h3>{$_('fallback.decrypt.selectRecipient', { default: 'Select recipient' })}</h3>
            <p class="card-subtitle">{$_('fallback.decrypt.selectRecipientDesc', { default: 'Please select which email belongs to you:' })}</p>
            <select bind:value={key} class="recipient-select">
                <option value=""></option>
                {#each keylist as k}
                    <option value={k}>{k}</option>
                {/each}
            </select>
        </div>

    {:else if decryptState === STATES.Qr}
        <div class="decrypt-card">
            <h3>{$_('fallback.decrypt.scanQr', { default: 'Scan QR code' })}</h3>
            {#if showHints}
                <div class="hints">
                    {#each hints as hint}
                        <span class="hint-chip">{hint}</span>
                    {/each}
                </div>
            {/if}
            <YiviQRCode id="yivi-fallback" responsive />
        </div>

    {:else if decryptState === STATES.Decrypting}
        <div class="spinner-wrapper">
            <svg class="spinner" viewBox="0 0 24 24" width="36" height="36">
                <circle class="spinner-circle" cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3"></circle>
            </svg>
        </div>
        <p class="status-text">{$_('fallback.decrypt.decrypting', { default: 'Decrypting...' })}</p>

    {:else if decryptState === STATES.Fail}
        <div class="decrypt-card error-card">
            <p class="error-text">{$_('fallback.decrypt.failure', { default: 'Decryption failed' })}</p>
            <p class="error-detail">{err}</p>
            <Chip
                text={$_('fallback.decrypt.retry')}
                onclick={retry}
                size="lg"
                variant="dark"
            />
        </div>
    {/if}
</div>

<style lang="scss">
    .decrypt-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 2rem;
        max-width: 400px;
        margin: 0 auto;
        gap: 1rem;
    }

    .spinner-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1rem 0;
    }

    .spinner {
        animation: spin 1s linear infinite;
        color: var(--pg-text-secondary);
    }

    .spinner-circle {
        stroke-dasharray: 60;
        stroke-dashoffset: 0;
        animation: dash 1.5s ease-in-out infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    @keyframes dash {
        0% { stroke-dashoffset: 60; }
        50% { stroke-dashoffset: 15; }
        100% { stroke-dashoffset: 60; }
    }

    .status-text {
        margin: 0;
        color: var(--pg-text-secondary);
        font-size: var(--pg-font-size-md);
        text-align: center;
    }

    .decrypt-card {
        background: var(--pg-soft-background);
        border: 1px solid var(--pg-strong-background);
        border-radius: var(--pg-border-radius-lg);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        width: 100%;

        h3 {
            font-weight: var(--pg-font-weight-bold);
            font-size: var(--pg-font-size-lg);
            margin: 0;
        }
    }

    .card-subtitle {
        margin: 0;
        color: var(--pg-text);
        font-size: var(--pg-font-size-md);
        line-height: 1.5;
    }

    .recipient-select {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--pg-strong-background);
        border-radius: var(--pg-border-radius-sm);
        background: var(--pg-general-background);
        color: var(--pg-text);
        font-family: var(--pg-font-family);
        font-size: var(--pg-font-size-base);
    }

    .hints {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
    }

    .hint-chip {
        display: inline-flex;
        align-items: center;
        padding: 0.2rem 0.6rem;
        border: 1px solid var(--pg-strong-background);
        border-radius: var(--pg-border-radius-sm);
        font-size: var(--pg-font-size-sm);
        color: var(--pg-text-secondary);
        background: var(--pg-general-background);
    }

    .error-card {
        align-items: center;
        text-align: center;
    }

    .error-text {
        margin: 0;
        font-weight: var(--pg-font-weight-bold);
        font-size: var(--pg-font-size-md);
        color: var(--pg-input-error);
    }

    .error-detail {
        margin: 0;
        font-size: var(--pg-font-size-sm);
        color: var(--pg-text-secondary);
        word-break: break-word;
    }
</style>
