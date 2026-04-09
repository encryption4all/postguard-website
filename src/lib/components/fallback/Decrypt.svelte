<script>
    import { run } from 'svelte/legacy';

    import { tick } from 'svelte'

    import {
        currSelected,
        currentId,
        nextId,
        emails,
    } from './stores'

    import * as decrypt from './decrypt.js'
    import * as email from './email'

    import { locale, _ } from 'svelte-i18n'

    import { pg } from '$lib/postguard'
    import { IdentityMismatchError } from '@e4a/pg-js'

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

    let decryptState = $state(STATES.Uninit)

    let policies = $state()
    let keylist = $state()
    let key = $state()

    let showHints = $state(false)
    let hints = $state([])

    let decryptedMail
    let err = $state()

    /** @type {{rightMode: any, readable: any}} */
    let { rightMode = $bindable(), readable } = $props();

    let opened = $state()

    function checkRecipients() {
        const recipients = [...policies.keys()].filter((k) => k)
        if (recipients.length === 1) {
            key = recipients[0]
        } else {
            keylist = recipients
            decryptState = STATES.Recipients
        }
    }

    function processCredentials() {
        const policy = policies.get(key)
        if (!policy?.con) return
        for (const c of policy.con) {
            if (c.t === 'pbdf.sidn-pbdf.mobilenumber.mobilenumber' && c.v) {
                showHints = true
                hints.push('Mobile number: ' + c.v)
            } else if (c.t === 'pbdf.pbdf.surfnet-2.id' && c.v) {
                showHints = true
                hints.push('Student ID: ' + c.v)
            }
        }
    }

    function retry() {
        err = undefined
        showHints = false
        hints = []
        decryptState = STATES.Qr
        tick().then(() => startDecryption())
    }

    async function startDecryption() {
        try {
            const result = await opened.decrypt({
                element: '#yivi-fallback',
                recipient: key,
                enableCache: true,
            })

            decryptState = STATES.Decrypting

            const outStream = new TextDecoder().decode(result.plaintext)
            decryptedMail = await email.parseMail(outStream)
            await storeMail(outStream)
        } catch (e) {
            err = e
            decryptState = STATES.Fail
        }
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
        if (decryptState === STATES.Uninit && readable) {
            const o = pg.open({ data: readable })
            opened = o
            o.inspect()
                .then((info) => {
                    decryptState = STATES.Init
                    policies = info.policies
                    checkRecipients()
                })
                .catch((e) => {
                    err = e
                    decryptState = STATES.Fail
                })
        }
    });
    run(() => {
        if ((decryptState === STATES.Init || decryptState === STATES.Recipients) && key) {
            processCredentials()
            decryptState = STATES.Qr
            tick().then(() => startDecryption())
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
