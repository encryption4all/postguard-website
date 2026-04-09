<script lang="ts">
    import { _, locale } from 'svelte-i18n'
    import { isValidPhoneNumber } from 'libphonenumber-js/mobile'
    import { NetworkError } from '@e4a/pg-js'

    import yiviLogoDark from '$lib/assets/images/non-free/yivi-logo-dark.svg'
    import { EncryptionState, type EncryptState } from '$lib/types/filesharing/attributes'
    import { pg } from '$lib/postguard'
    import { browser } from '$app/environment'
    import { isMobile } from '$lib/browser-detect'
    import YiviQRCode from './YiviQRCode.svelte'
    import HelpToggle from '../HelpToggle.svelte'
    import Chip from '../Chip.svelte'

    import { MAX_UPLOAD_SIZE } from '$lib/env'

    interface props {
        EncryptState: EncryptState;
    }

    let { EncryptState = $bindable() }: props = $props()

    let isMobileDevice = isMobile()
    let mobilePopupMode: 'none' | 'direct' | 'qr' = $state('none')
    let showValidationModal = $state(false)
    let validationErrors: string[] = $state([])

    let SMOOTH_TIME = 2

    const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    let canEncrypt = $derived(() => {
        if (EncryptState.files.length === 0) return false
        const totalSize = EncryptState.files.reduce((a, f) => a + f.size, 0)
        if (totalSize >= MAX_UPLOAD_SIZE) return false
        if (!EncryptState.recipients.every(({ email }) => emailRegex.test(email))) return false
        if (!EncryptState.recipients.every(({ extra }) => extra.every((att) => {
            if (!att.v || att.v.length === 0) return false
            if (att.t === 'pbdf.sidn-pbdf.mobilenumber.mobilenumber' && !isValidPhoneNumber(att.v)) return false
            return true
        }))) return false
        return true
    })

    function getValidationErrors(): string[] {
        const errors: string[] = []
        if (EncryptState.files.length === 0) {
            errors.push($_('filesharing.encryptPanel.validation.noFiles'))
        }
        const totalSize = EncryptState.files.reduce((a, f) => a + f.size, 0)
        if (totalSize >= MAX_UPLOAD_SIZE) {
            errors.push($_('filesharing.encryptPanel.validation.filesTooLarge', {
                values: { max: (MAX_UPLOAD_SIZE / (1024 ** 3)).toFixed(0) }
            }))
        }
        EncryptState.recipients.forEach(({ email, extra }) => {
            if (!email || email.trim() === '') {
                errors.push($_('filesharing.encryptPanel.validation.noEmail'))
            } else if (!emailRegex.test(email)) {
                errors.push($_('filesharing.encryptPanel.validation.invalidEmail', { values: { email } }))
            } else {
                extra.forEach(({ t, v }) => {
                    if (!v || v.length === 0) {
                        const attrName = $_(`filesharing.attributes.${t}`)
                        errors.push($_('filesharing.encryptPanel.validation.missingAttribute', { values: { attribute: attrName, email } }))
                    } else if (t === 'pbdf.sidn-pbdf.mobilenumber.mobilenumber' && !isValidPhoneNumber(v)) {
                        errors.push($_('filesharing.encryptPanel.validation.invalidPhone', { values: { email } }))
                    }
                })
            }
        })
        return errors
    }

    async function onSign(): Promise<void> {
        const errors = getValidationErrors()
        if (errors.length > 0) {
            validationErrors = errors
            showValidationModal = true
            return
        }
        if (isMobileDevice && mobilePopupMode === 'none') {
            mobilePopupMode = 'direct'
        }
        await startEncryption()
    }

    async function startEncryption(): Promise<void> {
        EncryptState.encryptionState = EncryptionState.Sign

        try {
            if (!canEncrypt()) return

            // Build recipients
            const recipients = EncryptState.recipients.map(({ email, extra }) => {
                if (extra.length > 0) {
                    return pg.recipient.withPolicy(email, [
                        { t: 'pbdf.sidn-pbdf.email.email', v: email },
                        ...extra,
                    ])
                }
                return pg.recipient.email(email)
            })

            // Build sign method — email always included, name optional (user chooses in Yivi app)
            const sign = pg.sign.yivi({
                element: '#crypt-irma-qr',
                attributes: [{ t: 'pbdf.gemeente.personalData.fullname' }],
            })

            let selectedLang: string = localStorage.getItem('preferredLanguage') ?? 'en-US'
            const lang = (selectedLang === 'nl-NL') ? 'NL' : 'EN'

            const sealed = pg.encrypt({
                files: EncryptState.files,
                recipients,
                sign,
                onProgress: (pct) => {
                    // First progress callback means signing is done
                    if (EncryptState.encryptionState === EncryptionState.Sign) {
                        EncryptState.encryptionState = EncryptionState.Encrypting
                        EncryptState.encryptStartTime = Date.now()
                        mobilePopupMode = 'none'
                    }
                    updateProgress(pct)
                },
                signal: EncryptState.abort.signal,
            })

            await sealed.upload({
                notify: {
                    message: EncryptState.message,
                    language: lang as 'EN' | 'NL',
                },
            })

            EncryptState.encryptionState = EncryptionState.Done
            EncryptState.selfAborted = false
        } catch (e) {
            console.error('Error occurred during encryption:', e)
            if (EncryptState.selfAborted) {
                EncryptState.percentages = EncryptState.files.map(() => 0)
                EncryptState.done = EncryptState.files.map(() => false)
                EncryptState.encryptionState = EncryptionState.FileSelection
                EncryptState.selfAborted = false
                EncryptState.encryptStartTime = 0
            } else {
                EncryptState.serverError = e instanceof NetworkError && e.status >= 500
                EncryptState.encryptionState = EncryptionState.Error
            }
            mobilePopupMode = 'none'
        }
    }

    function updateProgress(pct: number) {
        const totalSize = EncryptState.files.reduce((a, f) => a + f.size, 0)
        if (totalSize === 0) return

        let offset = 0
        const percentages = EncryptState.files.map((f) => {
            const fileStart = (offset / totalSize) * 100
            const fileEnd = ((offset + f.size) / totalSize) * 100
            offset += f.size
            if (pct >= fileEnd) return 100
            if (pct <= fileStart) return 0
            return Math.round(((pct - fileStart) / (fileEnd - fileStart)) * 100)
        })
        EncryptState.percentages = percentages

        // Delay done status for smooth animation
        percentages.forEach((p, i) => {
            if (p >= 100 && !EncryptState.done[i]) {
                window.setTimeout(() => {
                    const dones = EncryptState.done.map((d) => d)
                    dones[i] = true
                    EncryptState.done = dones
                }, 1000 * SMOOTH_TIME)
            }
        })
    }

    let lang = $state('nl')
    if (browser) {
        lang = (localStorage.getItem('preferredLanguage') ?? 'nl-NL').substring(0, 2)
    }

    let yiviInfoExpanded = $state(false)
    let buttonRef: HTMLButtonElement | null = $state(null)
    let dialogRef: HTMLDialogElement | null = $state(null)

    $effect(() => {
        if (!browser || !dialogRef) return
        if (showValidationModal) {
            dialogRef.showModal()
        } else if (dialogRef.open) {
            dialogRef.close()
        }
    })
</script>
<div class="button-container">
    {#if EncryptState.encryptionState === EncryptionState.Encrypting}
        <!-- Loading info box during upload -->
        {@const totalProgress = EncryptState.percentages.length > 0
            ? Math.round(EncryptState.percentages.reduce((a, b) => a + b, 0) / EncryptState.percentages.length)
            : 0}
        <div class="upload-info-box">
            <div class="progress-bar" class:complete={totalProgress >= 100} style="width: {totalProgress >= 100 ? '100%' : totalProgress + '%'}"></div>
            <div class="upload-info-content">
                <svg class="spinner" viewBox="0 0 24 24" width="24" height="24">
                    <circle class="spinner-circle" cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3"></circle>
                </svg>
                {$_('filesharing.encryptPanel.sending')}
            </div>
        </div>
    {:else}
        <!-- Normal button -->
        <button
            bind:this={buttonRef}
            class="primary-btn send-btn"
            onclick={onSign}
        >
            <img src={yiviLogoDark} alt="yivi-logo" width={50} height={27} />
            {$_('filesharing.encryptPanel.encryptSend')}
        </button>

        <!-- Mobile: Always show QR option when button is enabled -->
        {#if isMobileDevice}
            <Chip
                text={$_('filesharing.sign.signOtherDevice')}
                onclick={() => {
                    mobilePopupMode = 'qr'
                    onSign()
                }}
                size="md"
                variant="default"
            />
        {/if}
    {/if}

    <p class="yivi-tip">
        {$_('filesharing.encryptPanel.yiviTip')}
    </p>


    <HelpToggle
        title={$_('filesharing.encryptPanel.yiviInfo')}
        content={$_('filesharing.encryptPanel.yiviInfoText')}
        linkText={$_('filesharing.encryptPanel.yiviInfoLink')}
        linkUrl="https://yivi.app"
        bordered
    />

    <!-- Desktop Yivi popup above the button -->
    {#if !isMobileDevice && EncryptState.encryptionState === EncryptionState.Sign && buttonRef}
        <button type="button" class="desktop-backdrop" tabindex="-1" aria-hidden="true" onclick={() => {
            EncryptState.encryptionState = EncryptionState.FileSelection
        }}></button>
        <div
            class="desktop-yivi-popup"
            style="
                left: {buttonRef.getBoundingClientRect().left + buttonRef.offsetWidth / 2}px;
                top: {buttonRef.getBoundingClientRect().top - 15}px;
            "
        >
            <div class="popup-content">
                <div class="popup-header">
                    <h2 class="popup-title">{$_('filesharing.encryptPanel.encryptSend')}</h2>
                    <Chip
                        text={$_('filesharing.sign.close')}
                        onclick={() => {
                            EncryptState.encryptionState = EncryptionState.FileSelection
                        }}
                        icon="×"
                        size="md"
                        variant="default"
                    />
                </div>

                <p class="popup-instruction">{$_('filesharing.sign.scanQR')}</p>

                <div class="qr-code-wrapper">
                    <YiviQRCode />
                </div>
            </div>
            <div class="popup-arrow"></div>
        </div>
    {/if}

    <!-- Mobile bottom sheet -->
    {#if isMobileDevice && mobilePopupMode !== 'none' && EncryptState.encryptionState === EncryptionState.Sign}
        <button type="button" class="mobile-backdrop" tabindex="-1" aria-hidden="true" onclick={() => {
            EncryptState.encryptionState = EncryptionState.FileSelection
            mobilePopupMode = 'none'
        }}></button>
        <div class="mobile-bottom-sheet">
            <div class="bottom-sheet-content">
                {#if mobilePopupMode === 'qr'}
                    <h2 class="bottom-sheet-title">{$_('filesharing.encryptPanel.encryptSend')}</h2>
                    <p class="bottom-sheet-instruction">{$_('filesharing.sign.scanQR')}</p>
                    <div class="qr-code-wrapper"><YiviQRCode /></div>
                    <Chip
                        text={$_('filesharing.sign.close')}
                        onclick={() => {
                            EncryptState.encryptionState = EncryptionState.FileSelection
                            mobilePopupMode = 'none'
                        }}
                        icon="×"
                        size="md"
                        variant="dark"
                    />
                {:else}
                    <p class="bottom-sheet-instruction">{$_('filesharing.sign.followSteps')}</p>
                    <div style="display: none;"><YiviQRCode mode="deeplink" /></div>
                    <Chip
                        text={$_('filesharing.sign.cancel')}
                        onclick={() => {
                            EncryptState.encryptionState = EncryptionState.FileSelection
                            mobilePopupMode = 'none'
                        }}
                        icon="×"
                        size="md"
                        variant="dark"
                    />
                {/if}
            </div>
        </div>
    {/if}
</div>

<dialog bind:this={dialogRef} class="validation-modal" tabindex="-1" oncancel={() => showValidationModal = false}>
    <h2 class="validation-title">{$_('filesharing.encryptPanel.validation.title')}</h2>
    <ul class="validation-errors">
        {#each validationErrors as error}
            <li>{error}</li>
        {/each}
    </ul>
    <button class="primary-btn" onclick={() => showValidationModal = false}>
        {$_('filesharing.encryptPanel.validation.continueButton')}
    </button>
</dialog>

<style lang="scss">
  .send-btn {
    margin: 1.5rem 0 0.8rem 0;
  }
  /* Fade the Yivi logo when the button is disabled */
  .primary-btn:disabled img {
    opacity: 0.5;
  }

  .button-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    position: relative;
  }

  @media only screen and (min-width: 768px) {
    .button-container {
      padding-left: 1.25rem;
    }
  }

  .upload-info-box {
    position: relative;
    width: 100%;
    border-radius: var(--pg-border-radius-sm);
    background: var(--pg-strong-background);
    margin-bottom: 0.75rem;
    box-sizing: border-box;
    overflow: hidden;
  }

  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4px;
    background: var(--pg-primary-contrast);
    transition: width 0.3s ease;
  }

  .upload-info-content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.75rem;
    padding: 1rem 1rem;
    font-size: var(--pg-font-size-base);
    font-weight: var(--pg-font-weight-regular);
    font-family: var(--pg-font-family);
    color: var(--pg-text);
    z-index: 1;
  }

  .upload-info-box .spinner-circle {
    stroke: var(--pg-text);
  }

  .spinner {
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
  }

  .spinner-circle {
    stroke-dasharray: 60;
    stroke-dashoffset: 0;
    animation: dash 1.5s ease-in-out infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dashoffset: 60;
    }
    50% {
      stroke-dashoffset: 15;
    }
    100% {
      stroke-dashoffset: 60;
    }
  }

  .yivi-tip {
    font-size: var(--pg-font-size-sm);
    color: var(--pg-text-secondary);
    font-family: var(--pg-font-family);
    margin: 0;
    line-height: 1.4;
  }

  /* Desktop Yivi popup styles */
  .desktop-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(3, 14, 23, 0.09);
    z-index: 3;
    cursor: pointer;
  }

  .desktop-yivi-popup {
    position: fixed;
    transform: translate(-50%, -100%);
    background: var(--pg-soft-background);
    border-radius: var(--pg-border-radius-md);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    width: var(--popup-width);
    z-index: 4;
  }

  .popup-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 0.5rem;
  }

  .popup-title {
    font-size: var(--pg-font-size-sm);
    font-weight: var(--pg-font-weight-bold);
    margin: 0;
    text-align: left;
    color: var(--pg-text);
    font-family: var(--pg-font-family);
    flex: 1;
  }

  .popup-instruction {
    font-size: var(--pg-font-size-sm);
    font-weight: var(--pg-font-weight-bold);
    margin: 0 0 0.5rem 0;
    text-align: left;
    color: var(--pg-text);
    font-family: var(--pg-font-family);
    width: 100%;
  }

  .qr-code-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }


  .popup-arrow {
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid var(--pg-soft-background);
  }

  /* Mobile bottom sheet styles */
  .mobile-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 3;
  }

  .mobile-bottom-sheet {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--pg-soft-background);
    border-radius: var(--pg-border-radius-lg) var(--pg-border-radius-lg) 0 0;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
    padding: 1.5rem;
    z-index: 4;
  }

  .bottom-sheet-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .bottom-sheet-title {
    font-size: var(--pg-font-size-sm);
    font-weight: var(--pg-font-weight-bold);
    margin: 0;
    text-align: center;
    color: var(--pg-text);
    font-family: var(--pg-font-family);
  }

  .bottom-sheet-instruction {
    font-size: var(--pg-font-size-sm);
    font-weight: var(--pg-font-weight-bold);
    margin: 0;
    text-align: center;
    color: var(--pg-text);
    font-family: var(--pg-font-family);
  }

  /* Validation modal */
  dialog.validation-modal {
    border: none;
    border-radius: var(--pg-border-radius-lg);
    padding: 1.75rem 1.5rem 1.5rem;
    width: 90%;
    max-width: 380px;
    gap: 1rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    background: var(--pg-general-background);
    color: var(--pg-text);
  }

  /* Only apply flex layout when the dialog is open.
     Setting display on dialog directly overrides the UA's display:none for closed dialogs. */
  dialog.validation-modal[open] {
    display: flex;
    flex-direction: column;
  }

  dialog.validation-modal::backdrop {
    background: rgba(0, 0, 0, 0.45);
  }

  .validation-title {
    font-size: var(--pg-font-size-lg);
    font-weight: var(--pg-font-weight-bold);
    margin: 0;
    color: var(--pg-text);
    font-family: var(--pg-font-family);
  }

  .validation-errors {
    margin: 0;
    padding-left: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .validation-errors li {
    font-size: var(--pg-font-size-sm);
    color: var(--pg-text-secondary);
    font-family: var(--pg-font-family);
    line-height: 1.4;
  }

  .validation-modal .primary-btn {
    align-self: stretch;
    justify-content: center;
  }
</style>
