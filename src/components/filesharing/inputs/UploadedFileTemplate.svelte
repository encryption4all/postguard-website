<script lang="ts">
    import remove from '$lib/assets/images/google-icons/remove.svg'
    import file from '$lib/assets/images/google-icons/file.svg'
</script>

<div class="files" id="template">
    <div>
        <div><p class="file-title" data-dz-name></p></div>
    </div>

    <div>
        <p data-dz-size></p>
        <button class="remove-button" data-dz-remove>
            <img src={remove} alt="remove button" />
        </button>
        <div class="dz-error-message"><span data-dz-errormessage></span></div>
    </div>
</div>

<style>
    @import "../shared-styles.css";
    @import "files-shared-sheet.css";

    .files {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 0.5em;

        background-color: white;
        border: 1px solid #e5e7eb;
        padding: 12px 14px;
        border-radius: var(--pg-border-radius-lg);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);

        width: 100%;
        margin-bottom: 10px;
        transition: all 0.2s ease;
    }

    .files:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-color: var(--pg-border-color);
    }

    .files div {
        display: flex;
        align-items: center;
        gap: 0.5em;
        text-wrap: wrap;
    }

    /* .preview-img {
        width: 40px;
        height: 30px;
        border-radius: 6px;
        object-fit: contain;
        background-color: #f9fafb;
        padding: 4px;
    } */


    .file-title {
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: var(--pg-font-family);
        font-weight: 600;
        margin: 0;
        color: var(--pg-text-primary);
    }

    .remove-button {
        cursor: pointer;
        height: 100%;
        padding: 4px;
        border-radius: var(--pg-border-radius);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .remove-button:hover {
        background-color: #fee2e2;
    }

    .remove-button * {
        cursor: pointer;
    }

    @media only screen and (min-width: 768px) {
        .file-title {
            max-width: 300px;
        }
    }
</style>
