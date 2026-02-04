<script lang="ts">
    import { _ } from 'svelte-i18n'
    import { onMount } from 'svelte'
    import Dropzone from 'dropzone'
    import 'dropzone/dist/dropzone.css'
    import plusIcon from '$lib/assets/images/plusicon.svg'
    import rawAdd from '$lib/assets/images/google-icons/add.svg?raw'
    import BasketDrawing from '$lib/assets/images/basket_no_plane.svg'
    import UploadedFileTemplate from '$lib/components/filesharing/inputs/UploadedFileTemplate.svelte'
    import { EncryptionState } from '$lib/lib/types/filesharing/attributes'

    // Disable auto-discover to prevent Dropzone from automatically attaching to all .dropzone elements
    Dropzone.autoDiscover = false

    let myDropzone: Dropzone | null = null

    interface props {
        files: File[];
        percentages: number[];
        done: boolean[];
        stage: EncryptionState;
    }

    let MAX_UPLOAD_SIZE = import.meta.env.VITE_MAX_UPLOAD_SIZE

    let maxFileSizeMB = MAX_UPLOAD_SIZE / (1024 * 1024)

    let { files = $bindable(), percentages = $bindable(), done = $bindable(), stage = $bindable() }: props = $props()

    // handle all the Dropzone setup in onMount to ensure it only runs in the browser
    onMount(() => {
        // @ts-ignore, it's always set if UploadedFileTemplate is set because it's SSR'd
        let previewTemplate = document.querySelector('#template').parentNode.innerHTML

        myDropzone = new Dropzone('#my-form', {
            url: '#', // Dummy URL, can't be empty
            autoProcessQueue: false, // Prevent automatic upload
            maxFilesize: maxFileSizeMB,
            previewsContainer: '#previews',
            previewTemplate: previewTemplate,
            clickable: '.upload-butt, .choose-files-btn, .post-upload-button', // Only these elements trigger file selection
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
      class:signing-dropzone={stage === EncryptionState.Sign}
      class:mobile-hide={stage === EncryptionState.Sign}
      class:hidden={stage === EncryptionState.Encrypting || stage === EncryptionState.Done}
>
    <!-- so dropzone can get the template but its invisible -->
    <div class="hidden">
        <UploadedFileTemplate />
    </div>
    <div class="dz-message">
        <h1 class="file-tagline" class:hidden={stage !== EncryptionState.FileSelection}>
            {$_('filesharing.encryptPanel.fileBox.tagline')}
        </h1>

        {#if files.length <= 0}
            <div class="upload-butt middle-block-size">
                <img class="drawing" src={BasketDrawing} alt="Add files" />
                <p class="drag-text">Sleep bestanden hierheen</p>
                <p class="or-text">of</p>
                <button class="choose-files-btn" type="button">Kies bestanden</button>
                <p class="max-size-text">Maximaal 2 GB</p>
            </div>
        {/if}

        <!-- couldn't simply do an else because the item was expected to be in the DOM before items can be dropped -->
        <div id="previews" class="middle-block-size dz-previews" class:hidden={files.length <= 0}
             class:signing={stage === EncryptionState.Sign}></div>
        <button class="dz-message post-upload-button desktop-hide" class:hidden={files.length <= 0}>
            <span style="display: flex; align-items: center; pointer-events: none;">{@html rawAdd}</span>
            Upload file
        </button>
    </div>
</form>


<style>
    @import "../shared-styles.css";
    @import "$lib/shared-styles.css";
    @import "files-shared-sheet.css";

    h1 {
        font-size: 1.75em;
        font-weight: 700;
        color: #1f2937;
        margin: 0;
    }

    h2 {
        margin: 0;
        color: #4b5563;
        font-weight: 600;
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
        justify-content: center;
        align-items: center;
    }

    .middle-block-size {
        width: 95%;
        max-width: 600px;
        min-height: fit-content;

    }

    .upload-butt {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        background: var(--pg-strong-background) 0%;
        border: 2px dashed var(--pg-border-color);
        border-radius: var(--pg-border-radius-lg);
        margin: 0;
        padding: 1.5rem 1rem;
        transition: all 0.3s ease;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(48, 149, 222, 0.08);
    }

    .upload-butt:hover {
        background: linear-gradient(135deg, #f3f8fd 0%, #c0d5ff 100%);
        border-color: #6096f2;
        box-shadow: 0 4px 16px rgba(48, 149, 222, 0.15);
        transform: translateY(-2px);
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
        color: #1f2937;
        text-align: center;
    }

    .or-text {
        margin: 0.5rem 0;
        font-size: 0.95rem;
        color: #9ca3af;
        text-align: center;
    }

    .choose-files-btn {
        background: #050e16;
        box-shadow: 1px 1px 5px grey;
        color: white;
        padding: 0.8rem 1.3rem;
        border-radius: var(--pg-border-radius-sm);
        font-size: 1.2rem;
        font-weight: 600;
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
        color: #9ca3af;
        text-align: center;
    }

    .dz-previews {
        height: fit-content;
        width: 100%;
        margin-top: 1em;
        display: flex;
        flex-direction: column;
        gap: 0;
        flex: 1 1 auto;
        overflow: auto;
    }

    .signing-dropzone .dz-previews {
        width: 100%;
    }

    .dropzone-with-files {
        padding: 0;
        justify-content: start;
        height: fit-content;
        max-height: 200px; /* So it shows roughly 2 and a half files (the half so it's clear it's scrollable)*/
    }

    .post-upload-button {
        flex: 0 0 auto;
        display: flex;
        width: 100%;
        flex-direction: row;
        align-items: center;
        justify-content: start;
        background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
        fill: white;
        color: white;
        padding: 0.75em 1em;
        border-radius: var(--pg-border-radius-lg);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        transition: all 0.2s ease;
        gap: 0.5em;
    }

    .post-upload-button:hover {
        background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        transform: translateY(-1px);
    }

    .post-upload-button:active {
        transform: translateY(0);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }

    @media only screen and (min-width: 768px) {
        .middle-block-size {
            min-height: 50vh;
            width: 70%;
        }

        .upload-butt {
            padding: 3rem 2rem;
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
            max-height: none;
            justify-content: center;
            padding: 20px 20px;
        }

        .signing-dropzone {
            justify-content: start;
            padding: 0 20px;
        }

        .signing {
            margin-top: 0;
        }
    }
</style>
