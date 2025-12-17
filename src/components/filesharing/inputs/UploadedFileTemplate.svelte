<script>
import remove from '$lib/assets/images/google-icons/remove.svg';
import file from '$lib/assets/images/google-icons/file.svg';
</script>

<div class="files" id="template">
    <div>
        <img class="preview-img"
             src={file} data-dz-thumbnail alt="file image preview" />
        <div><p data-dz-name></p></div>
    </div>

    <div>
        <p data-dz-size></p>
        <button class="remove-button" data-dz-remove>
            <img src={remove} alt="remove button"/>
        </button>
        <div class="dz-error-message"><span data-dz-errormessage></span></div>
    </div>
</div>

<style>
    @import "../shared-styles.css";

    .files {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 0.5em;

        background-color: #d9d9d9;
        padding: 10px;
        border-radius: 5px;

        width: 100%;
        margin-bottom: 10px;
    }

    .files div {
        display: flex;
        align-items: center;
        gap: 0.3em;
        text-wrap: wrap;
    }

    .preview-img {
        width: 90px;
        height: 60px;
        border-radius: 5px;
        object-fit: contain;
    }

    .remove-button, .remove-button * {
        cursor: pointer;
        height: 100%;
    }
</style>