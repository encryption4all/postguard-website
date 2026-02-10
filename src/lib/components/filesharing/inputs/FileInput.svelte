<script lang="ts">
    import { _ } from 'svelte-i18n'
    import { onMount } from 'svelte'
    import Dropzone from 'dropzone'
    import 'dropzone/dist/dropzone.css'
    import BasketDrawing from '$lib/assets/images/basket_no_plane.svg'
    import UploadedFileTemplate from '$lib/components/filesharing/inputs/UploadedFileTemplate.svelte'
    import Chip from '$lib/components/Chip.svelte'
    import { EncryptionState } from '$lib/types/filesharing/attributes'

    // Disable auto-discover to prevent Dropzone from automatically attaching to all .dropzone elements
    Dropzone.autoDiscover = false

    let myDropzone: Dropzone | null = null

    interface props {
        files: File[];
        percentages: number[];
        done: boolean[];
        stage: EncryptionState;
    }

    let MAX_UPLOAD_SIZE = Number(import.meta.env.VITE_MAX_UPLOAD_SIZE)

    let maxFileSizeMB = MAX_UPLOAD_SIZE / (1024 * 1024)

    let { files = $bindable(), percentages = $bindable(), done = $bindable(), stage = $bindable() }: props = $props()

    let totalSize = $derived(files.reduce((acc, file) => acc + file.size, 0))
    let remainingSize = $derived(MAX_UPLOAD_SIZE - totalSize)
    let remainingSizeGB = $derived((remainingSize / (1024 * 1024 * 1024)).toFixed(2))

    // handle all the Dropzone setup in onMount to ensure it only runs in the browser
    onMount(() => {
        // @ts-ignore, it's always set if UploadedFileTemplate is set because it's SSR'd
        let previewTemplate = document.querySelector('#template-container').innerHTML

        myDropzone = new Dropzone('#my-form', {
            url: '#', // Dummy URL, can't be empty
            autoProcessQueue: false, // Prevent automatic upload
            maxFilesize: maxFileSizeMB,
            previewsContainer: '#previews',
            previewTemplate: previewTemplate,
            clickable: '.dropzone-box, .choose-files-btn, .add-more-chip-container', // Only these elements trigger file selection
        })

        myDropzone.on('addedfile', file => {
            files = files.concat([file])
            percentages = percentages.concat([0])
            done = done.concat([false])

            myDropzone!.emit('complete', file)
        })

        myDropzone.on('removedfile', file => {
            const index = files.findIndex(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)
            if (index !== -1) {
                files = files.slice(0, index).concat(files.slice(index + 1))
                percentages = percentages.slice(0, index).concat(percentages.slice(index + 1))
                done = done.slice(0, index).concat(done.slice(index + 1))
            }
        })

        return () => {
            if (myDropzone) {
                myDropzone.destroy()
            }
        }
    })
</script>
<form id="my-form" class="dropzone"
      class:dropzone-with-files={files.length > 0}
      class:hidden={stage === EncryptionState.Done || stage === EncryptionState.Error}
>
    <!-- so dropzone can get the template but its invisible -->
    <div class="hidden" id="template-container">
        <UploadedFileTemplate />
    </div>
    <div class="dz-message">
        <h1 class="file-tagline">
            {$_('filesharing.encryptPanel.fileBox.tagline')}
        </h1>

        <div class="dropzone-box"
             class:has-files={files.length > 0}
             class:encrypting={stage === EncryptionState.Encrypting}
             class:signing={stage === EncryptionState.Sign}>
            <div class="upload-butt middle-block-size" class:hidden={files.length > 0}>
                <img class="drawing" src={BasketDrawing} alt="Add files" />
                <p class="drag-text">{$_('filesharing.encryptPanel.fileBox.dragText')}</p>
                <p class="or-text">{$_('filesharing.encryptPanel.fileBox.orText')}</p>
                <button class="choose-files-btn btn-accent" type="button">{$_('filesharing.encryptPanel.fileBox.chooseFilesButton')}</button>
                <p class="max-size-text">{$_('filesharing.encryptPanel.fileBox.maxSizeText')}</p>
            </div>

            <!-- couldn't simply do an else because the item was expected to be in the DOM before items can be dropped -->
            <div class="files-container" class:hidden={files.length <= 0}>
                <div id="previews" class="dz-previews"
                     class:signing={stage === EncryptionState.Sign}
                     class:encrypting={stage === EncryptionState.Encrypting}></div>

                {#if stage !== EncryptionState.Encrypting}
                    <div class="add-more-chip-container">
                        <Chip
                            text={$_('filesharing.encryptPanel.fileBox.addMoreFiles')}
                            icon="+"
                            size="lg"
                            variant="default"
                        />
                    </div>
                {/if}

                <div class="file-summary">
                    <p>{$_('filesharing.encryptPanel.fileBox.fileSummary', { values: { count: files.length, size: remainingSizeGB } })}</p>
                </div>
            </div>
        </div>
    </div>
</form>


<style>
    @import "../shared-styles.css";
    @import "$lib/shared-styles.css";
    @import "files-shared-sheet.css";

    h1 {
        font-size: 1.75em;
        font-weight: 700;
        color: --pg-text-primary;
        margin: 0;
    }

    .file-tagline {
        margin-bottom: 1rem;
        text-align: center;
    }

    .dropzone {
        border: none;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    @media only screen and (min-width: 768px) {
        .dropzone {
            height: 100%;
        }
    }

    .dz-message {
        margin: 0;
        width: 100%;
        min-height: 0;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
    }

    .middle-block-size {
        width: 95%;
        max-width: 600px;
        min-height: fit-content;
    }

    .dropzone-box {
        width: 95%;
        max-width: 600px;
        background: var(--pg-strong-background) 0%;
        border: 2px dashed var(--pg-border-color-light);
        border-radius: var(--pg-border-radius-lg);
        padding: 1.5rem 1rem;
        box-shadow: 0 2px 8px rgba(48, 149, 222, 0.08);
        transition: all 0.3s ease;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: fit-content;
    }

    .dropzone-box.has-files {
        cursor: default;
        pointer-events: none;
    }

    .dropzone-box.encrypting,
    .dropzone-box.signing {
        cursor: default;
        pointer-events: none !important;
    }

    .dz-previews.encrypting {
        pointer-events: none;
    }

    .dropzone-box:hover:not(.has-files) {
        border-color: #6096f2;
        box-shadow: 0 4px 16px rgba(48, 149, 222, 0.15);
    }

    .upload-butt {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        margin: 0;
        padding: 0;
        transition: all 0.3s ease;
        width: 100%;
    }

    .upload-butt img {
        margin-bottom: 0.5rem;
        width: 100%;
        max-width: 300px;
        height: auto;
        transition: transform 0.2s ease;
        user-select: none;
        pointer-events: none;
    }

    .upload-butt:hover img {
        transform: scale(1.1);
    }

    .drag-text {
        margin: 1rem 0 0rem 0;
        font-size: clamp(1.4rem, 2.5vw, 1.25rem);
        font-weight: 800;
        color: --pg-text-primary;
        text-align: center;
    }

    .or-text {
        margin: 0.5rem 0;
        font-size: 0.95rem;
        font-weight: 300;
        color: #9ca3af;
        text-align: center;
    }

    .choose-files-btn {
        background: var(--pg-text-primary);
        box-shadow: 1px 1px 5px grey;
        color: var(--pg-general-bg);
        padding: 0.8rem 1.3rem;
        border-radius: var(--pg-border-radius-sm);
        font-size: 1.2rem;
        font-weight: 400;
        cursor: pointer;
        transition: all 0.2s ease;
        box-sizing: border-box;
    }

    .choose-files-btn:hover {
        background: #1a1a1a;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }

    .max-size-text {
        margin: 0.75rem 0 0 0;
        font-size: 0.875rem;
        font-weight: 300;
        color: #9ca3af;
        text-align: center;
    }

    .files-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .dropzone-box.has-files .files-container {
        pointer-events: auto;
    }

    .dropzone-box.encrypting .files-container,
    .dropzone-box.signing .files-container {
        pointer-events: none;
    }

    .dropzone-box.encrypting .add-more-chip-container,
    .dropzone-box.signing .add-more-chip-container {
        pointer-events: none;
        display: none;
    }

    .dz-previews {
        height: fit-content;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-height: 300px;
        overflow-y: auto;
        pointer-events: auto;
    }

    .dz-previews.encrypting :global(.remove-button) {
        display: none !important;
    }

    .add-more-chip-container {
        display: flex;
        justify-content: center;
        pointer-events: auto;
    }

    .add-more-chip-container :global(.chip) {
        cursor: pointer;
    }

    .file-summary {
        width: 100%;
        text-align: center;
        padding: 0.5rem 0;
        pointer-events: none;
    }

    .file-summary p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--pg-text-secondary);
        font-weight: 600;
    }

    .dropzone-with-files {
        padding: 0;
        justify-content: start;
        height: fit-content;
    }


    @media only screen and (min-width: 768px) {
        .middle-block-size {
            min-height: 50vh;
            width: 70%;
        }

        .dropzone-box {
            width: 70%;
            padding: 3rem 2rem;
            min-height: 20rem;
            max-height: 30rem;
        }

        .dropzone-box.has-files {
            min-height: fit-content;
            padding: 1.5rem 1rem;
        }

        .upload-butt {
            padding: 0;
        }

        .upload-butt img {
            margin-bottom: 1rem;
            width: 60%;
            max-width: 400px;
        }

        .dz-previews {
            gap: 0.5rem;
        }

        .dropzone-with-files {
            height: auto;
            justify-content: center;
        }

        .signing {
            margin-top: 0;
        }
    }
</style>
