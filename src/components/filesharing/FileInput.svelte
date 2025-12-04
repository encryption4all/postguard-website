<script lang="ts">
    import { onMount } from 'svelte'
    import Dropzone from "dropzone"
    import "dropzone/dist/dropzone.css"

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

    let {files = $bindable(), percentages = $bindable(), done = $bindable()}: props = $props()

    function onFile(file: File) {
        files = files.concat([file]);
        percentages = percentages.concat([0]);
        done = done.concat([false]);
    }

    // handle all the Dropzone setup in onMount to ensure it only runs in the browser
    onMount(() => {
        myDropzone = new Dropzone("#my-form", {
            url: "#", // Dummy URL, can't be empty
            autoProcessQueue: false, // Prevent automatic upload
            addRemoveLinks: true,
            dictDefaultMessage: "Drop files here or click to upload.",
            maxFilesize: maxFileSizeMB,
        })

        myDropzone.on("addedfile", file => {
            console.log(`File added: ${file.name}`)

            // Add the file to our state
            onFile(file);

            // set the files as processed to avoid upload errors
            myDropzone!.emit("complete", file)
        })

        return () => {
            if (myDropzone) {
                myDropzone.destroy()
            }
        }
    })
</script>

<div class="crypt-file-box" id="dropzone">

    <form id="my-form" class="dropzone">
        <div class="dz-message" data-dz-message>
            <span>Drop files here or click to upload.</span>
        </div>
    </form>
</div>

<style lang="scss">
  @use 'shared-styles';
</style>
