<script lang="ts">
    import {
        type AttType,
        EncryptionState,
        type EncryptState,
    } from '$lib/types/filesharing/attributes'
    import SEO from '$lib/components/SEO.svelte'
    import RecipientSelection from '$lib/components/filesharing/RecipientSelection.svelte'
    import MessageInput from '$lib/components/filesharing/inputs/MessageInput.svelte'
    import SendButton from '$lib/components/filesharing/SendButton.svelte'
    import FileInput from '$lib/components/filesharing/inputs/FileInput.svelte'
    import ErrorPanel from '$lib/components/filesharing/Error.svelte'
    import Done from '$lib/components/filesharing/Done.svelte'
    import CrashReport from '$lib/components/filesharing/CrashReport.svelte'

    const ATTRIBUTES: Array<AttType> = [
        'pbdf.sidn-pbdf.mobilenumber.mobilenumber',
        'pbdf.gemeente.personalData.dateofbirth',
    ]

    function createDefaultEncryptState(): EncryptState {
        return {
            recipients: [{ email: '', extra: [] }],
            sender: '',
            message: '',
            files: [],
            percentages: [],
            done: [],
            encryptionState: EncryptionState.FileSelection,
            abort: new AbortController(),
            selfAborted: false,
            serverError: false,
            encryptStartTime: 0,
        }
    }

    let encryptState: EncryptState = $state(createDefaultEncryptState())

    // Warn the user before they navigate away mid-upload. Cryptify does not
    // support resume yet, so navigating away silently aborts the upload and
    // discards all progress (see encryption4all/postguard-website#116,
    // encryption4all/postguard-website#117). The built-in browser dialog is
    // the only reliable cross-browser hook for this; modern browsers ignore
    // the returned message and show their own wording.
    $effect(() => {
        if (encryptState.encryptionState !== EncryptionState.Encrypting) return
        const handler = (event: BeforeUnloadEvent) => {
            event.preventDefault()
            event.returnValue = ''
        }
        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    })

    const fileshareJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'PostGuard Secure File Sharing',
        url: 'https://postguard.eu/fileshare',
        description:
            'Send end-to-end encrypted files to anyone using their email address. Encryption happens entirely in your browser.',
        applicationCategory: 'SecurityApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'EUR',
        },
        isPartOf: {
            '@id': 'https://postguard.eu/#website',
        },
    }
</script>

<SEO
    title="Secure File Sharing"
    description="Send end-to-end encrypted files to anyone using their email address. Your files are encrypted in your browser before they leave your device."
    jsonLd={fileshareJsonLd}
/>

<div
    class:container={encryptState.encryptionState ===
        EncryptionState.FileSelection ||
        encryptState.encryptionState === EncryptionState.Sign ||
        encryptState.encryptionState === EncryptionState.Encrypting ||
        encryptState.encryptionState === EncryptionState.Error}
    class:done={encryptState.encryptionState === EncryptionState.Done}
>
    <svelte:boundary>
        <FileInput
            bind:files={encryptState.files}
            bind:percentages={encryptState.percentages}
            bind:done={encryptState.done}
            bind:stage={encryptState.encryptionState}
        />
        {#if encryptState.encryptionState === EncryptionState.FileSelection || encryptState.encryptionState === EncryptionState.Sign || encryptState.encryptionState === EncryptionState.Encrypting}
            <div class="inputs-container">
                <RecipientSelection
                    bind:recipients={encryptState.recipients}
                    attributes={ATTRIBUTES}
                    readonly={encryptState.encryptionState ===
                        EncryptionState.Encrypting}
                />
                <MessageInput
                    bind:message={encryptState.message}
                    readonly={encryptState.encryptionState ===
                        EncryptionState.Encrypting}
                />
                <SendButton bind:encryptState />
            </div>
        {:else if encryptState.encryptionState === EncryptionState.Error}
            <div class="inputs-container">
                <ErrorPanel
                    bind:encryptionState={encryptState.encryptionState}
                    serverError={encryptState.serverError}
                />
            </div>
        {:else if encryptState.encryptionState === EncryptionState.Done}
            <Done bind:encryptState {createDefaultEncryptState} />
        {/if}
        {#snippet failed(error, reset)}
            <CrashReport
                {error}
                reset={() => {
                    encryptState = createDefaultEncryptState()
                    reset()
                }}
            />
        {/snippet}
    </svelte:boundary>
</div>

<style lang="scss">
    * {
        list-style-type: none;
    }

    .container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        margin-inline: 1rem;
        padding: 0.5rem 0;
    }

    .inputs-container {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        font-size: var(--pg-font-size-lg);
        min-width: 0;
        gap: 1.25rem;
        margin: 0;
    }

    .done {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
        overflow: hidden;
    }

    @media only screen and (min-width: 768px) {
        .container {
            display: grid;
            grid-template-columns: 1fr min(800px, 43%);
            gap: 2rem;
            height: calc(
                100vh - 52px - 0.5rem - 1rem
            ); /* navbar height + margin */
            overflow-y: hidden;
        }

        .inputs-container {
            max-height: 100%;
            margin: 1rem 0 0 0;
            padding-right: 1rem;
            overflow-y: auto;
            border-left: 2px solid var(--pg-strong-background);
            display: flex;
            justify-content: flex-start;
        }
    }
</style>
