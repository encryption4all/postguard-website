<script lang="ts">
    import { onMount } from 'svelte'
    import Dropzone from 'dropzone'
    import 'dropzone/dist/dropzone.css'
    import plusIcon from '$lib/assets/images/plusicon.svg'
    import yiviLogo from '$lib/assets/images/non-free/yivi-logo.svg'
    import UploadedFileTemplate from '$lib/components/filesharing/UploadedFileTemplate.svelte'

    // Disable auto-discover to prevent Dropzone from automatically attaching to all .dropzone elements
    Dropzone.autoDiscover = false

    let myDropzone: Dropzone | null = null

    interface props {
        files: File[];
        percentages: number[];
        done: boolean[];
    }

    let MAX_UPLOAD_SIZE = import.meta.env.VITE_MAX_UPLOAD_SIZE

    let maxFileSizeMB = MAX_UPLOAD_SIZE / (1024 * 1024)

    let { files = $bindable(), percentages = $bindable(), done = $bindable() }: props = $props()

    function onFile(file: File) {
        files = files.concat([file])
        percentages = percentages.concat([0])
        done = done.concat([false])
    }

    // handle all the Dropzone setup in onMount to ensure it only runs in the browser
    onMount(() => {
        // @ts-ignore, it's always set if UploadedFileTemplate is set because it's SSR'd
        let previewTemplate = document.querySelector("#template").parentNode.innerHTML;

        myDropzone = new Dropzone('#my-form', {
            url: '#', // Dummy URL, can't be empty
            autoProcessQueue: false, // Prevent automatic upload
            addRemoveLinks: true,
            dictDefaultMessage: 'Drop files here or click to upload.',
            maxFilesize: maxFileSizeMB,
            previewTemplate: previewTemplate,
        })

        myDropzone.on('addedfile', file => {
            console.log(`File added: ${file.name}`)

            // Add the file to our state
            onFile(file)

            // set the files as processed to avoid upload errors
            myDropzone!.emit('complete', file)
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
    <div style="display: none"><UploadedFileTemplate /></div>
    <h1 style="margin-bottom: 8px">Securely send your files with:</h1>
    <img src={yiviLogo} alt="Yivi Logo" style="width: 120px; margin-bottom: 1rem;" />

    <div class="dz-message" data-dz-message>
        <img src={plusIcon} alt="Add files" />
        <h3>Drop files here or click to upload.</h3>
    </div>
</form>
<style>
    @import "shared-styles.css";

    .dz-message {
        padding: 10% 30%;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-weight: 600;
        background-color: #e0eaff;
        border-radius: 10px;
    }

    .dz-message img {
        margin-bottom: 1rem;
        width: 50%;
        height: 50%;
    }

    .dropzone {
        border: none;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
</style>
