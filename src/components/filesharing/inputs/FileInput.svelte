<script lang="ts">
    import { _ } from 'svelte-i18n'
    import { onMount } from 'svelte'
    import Dropzone from 'dropzone'
    import 'dropzone/dist/dropzone.css'
    import plusIcon from '$lib/assets/images/plusicon.svg'
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

    function onFile(file: File) {
        files = files.concat([file])
        percentages = percentages.concat([0])
        done = done.concat([false])
    }

    // handle all the Dropzone setup in onMount to ensure it only runs in the browser
    onMount(() => {
        // @ts-ignore, it's always set if UploadedFileTemplate is set because it's SSR'd
        let previewTemplate = document.querySelector('#template').parentNode.innerHTML

        myDropzone = new Dropzone('#my-form', {
            url: '#', // Dummy URL, can't be empty
            autoProcessQueue: false, // Prevent automatic upload
            dictDefaultMessage: 'Drop files here or click to upload.',
            maxFilesize: maxFileSizeMB,
            previewsContainer: '#previews',
            previewTemplate: previewTemplate,
        })

        myDropzone.on('addedfile', file => {
            console.log(`File added: ${file.name}`)

            // Add the file to our state
            onFile(file)

            // set the files as processed to avoid upload errors
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
<form id="my-form" class="dropzone">
    <!-- so dropzone can get the template but its invisible -->
    <div style="display: none">
        <UploadedFileTemplate bind:stage={stage} />
    </div>
    <h1 style="margin-bottom: 8px">{$_('filesharing.encryptPanel.fileBox.tagline')}</h1>

    {#if files.length <= 0}
        <div class="dz-message middle-block-size" data-dz-message>
            <h2>
                {@html $_('filesharing.encryptPanel.fileBox.upperTextDropZone')}
            </h2>
            <img src={plusIcon} alt="Add files" />
            <h2>{@html $_('filesharing.encryptPanel.fileBox.lowerTextDropZone')}</h2>
        </div>
    {/if}
    <!-- couldn't simply do an else because the item was expected to be in the DOM before items can be drug -->
    <div id="previews" class="dz-previews middle-block-size" class:hidden={files.length <= 0}></div>
</form>


<style>
    @import "../shared-styles.css";

    h2 {
        margin: 0;
    }

    .hidden {
        display: none !important;
    }

    .dropzone {
        border: none;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .middle-block-size {
        height: 50vh;
    }

    .dz-message {
        width: 90%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        background-color: #e0eaff;
        border-radius: 10px;
        margin: 0;
    }

    .dz-message img {
        margin-bottom: 1rem;
        width: 8em
    }

    .dz-previews {
        width: 90%;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        overflow: auto;
    }
</style>
