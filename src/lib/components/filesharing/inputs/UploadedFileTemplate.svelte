<script lang="ts">
    import remove from '$lib/assets/images/google-icons/remove.svg'
    import file from '$lib/assets/images/google-icons/file.svg'
</script>

<div class="files">
    <div>
        <div><p class="file-title" data-dz-name></p></div>
    </div>

    <div>
        <p data-dz-size></p>
        <button class="remove-button" data-dz-remove type="button">
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
        width: 100%;
        margin-bottom: 0;
        padding: 8px 0;
        border-bottom: 2px solid var(--pg-border-color-light);
    }

    .files > div:first-child {
        display: flex;
        align-items: center;
        gap: 0.5em;
        flex: 1;
        min-width: 0;
    }

    .files > div:last-child {
        display: flex;
        align-items: center;
        gap: 0.5em;
        flex-shrink: 0;
    }

    /* .preview-img {
        width: 40px;
        height: 30px;
        border-radius: var(--pg-border-radius-md);
        object-fit: contain;
        background-color: #f9fafb;
        padding: 4px;
    } */


    .file-title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: var(--pg-font-family);
        font-weight: 400;
        margin: 0;
        color: var(--pg-text-primary);
        min-width: 0;
        font-size: 0.9rem;
    }

    .files > div:last-child p {
        font-family: var(--pg-font-family);
        font-weight: 400;
        margin: 0;
        color: var(--pg-text-secondary);
        font-size: 0.9rem;
    }

    .remove-button {
        cursor: pointer;
        height: 100%;
        padding: 4px;
        border-radius: var(--pg-border-radius-md);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
    }

    .remove-button:hover {
        background-color: #fee2e2;
    }

    .remove-button * {
        cursor: pointer;
    }
</style>
