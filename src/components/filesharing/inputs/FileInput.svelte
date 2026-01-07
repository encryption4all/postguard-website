<script lang="ts">
    import { _ } from 'svelte-i18n'
    import { onMount } from 'svelte'
    import Dropzone from 'dropzone'
    import 'dropzone/dist/dropzone.css'
    import plusIcon from '$lib/assets/images/plusicon.svg'
    import rawAdd from '$lib/assets/images/google-icons/add.svg?raw'
    import BasketDrawing from '$lib/assets/images/basket.svg'
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
            clickable: '.upload-butt, .post-upload-button', // Only these elements trigger file selection
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
        <h1 style="margin-bottom: 8px; text-align: center"
            class:mobile-hide={files.length > 0} class:hidden={stage !== EncryptionState.FileSelection}>
            {$_('filesharing.encryptPanel.fileBox.tagline')}
        </h1>

        {#if files.length <= 0}
            <div class="upload-butt middle-block-size">
                <h2 class="top-upload-text">
                    {@html $_('filesharing.encryptPanel.fileBox.upperTextDropZone')}
                </h2>
                <img src={plusIcon} alt="Add files" draggable="false" />
                <h2 class="bottom-upload-text">{@html $_('filesharing.encryptPanel.fileBox.lowerTextDropZone')}</h2>
            </div>
            <img src={BasketDrawing} alt="Basket drawing" class="drawing" draggable="false" />
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
        height: 30vh;

    }

    .upload-butt {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        background: linear-gradient(135deg, #e0eaff 0%, #d0e0ff 100%);
        border: 2px dashed #8eb4f5;
        border-radius: 16px;
        margin: 0;
        transition: all 0.3s ease;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(48, 149, 222, 0.08);
    }

    .upload-butt:hover {
        background: linear-gradient(135deg, #d0e0ff 0%, #c0d5ff 100%);
        border-color: #6096f2;
        box-shadow: 0 4px 16px rgba(48, 149, 222, 0.15);
        transform: translateY(-2px);
    }

    .upload-butt img {
        margin-bottom: 1rem;
        width: 5em;
        transition: transform 0.2s ease;
        user-select: none;
        pointer-events: none;
    }

    .upload-butt:hover img {
        transform: scale(1.1);
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
    .drawing {
        display: block;
        width: 100%;
        margin-top: 3vh;
        justify-self: end;
        background-color: unset;
        border-radius: 0;

    }

    .signing-dropzone .dz-previews {
        width: 100%;
    }

    .top-upload-text {
        display: none;
    }

    .bottom-upload-text {
        text-transform: capitalize;
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
        border-radius: 8px;
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
            height: 50vh;
            width: 70%;
        }

        .upload-butt img {
            margin-bottom: 1rem;
            width: 8em;
        }

        .top-upload-text {
            display: block;
        }

        .drawing {
            display: none;
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
