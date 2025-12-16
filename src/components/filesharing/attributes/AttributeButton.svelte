<script lang="ts">

    import { _ } from 'svelte-i18n'
    import removeButton from '$lib/assets/images/google-icons/remove.svg'

    interface props {
        clickAction?: () => void;
        translation_key: string;
        type: 'add' | 'added';
    }

    let { clickAction, translation_key, type }: props = $props()
</script>


{#if type === 'add'}
        <button
            class="add-attribute-btn"
            onclick={clickAction}>
            {$_(translation_key)} {clickAction ? '+' : ''}
        </button>
{:else if type === 'added'}
    <button
        class="added-attribute"
        onclick={clickAction}>
        {$_(translation_key)}
        {#if clickAction}
            <img style="width: 20px" src={removeButton} alt="delete attribute" />
        {/if}
    </button>
{/if}

<style>
    .add-attribute-btn {
        color: black;
        border: 1px solid black;
        border-radius: 5px;
        background-color: white;
        font-family: Overpass;
        cursor: pointer;
        padding: 2px 4px;
    }

    .added-attribute {
        display: flex;
        align-items: center;
        color: black;
        background-color: #d9d9d9;
        font-family: Overpass;
        text-align: start;
        width: fit-content;
        padding: 4px 6px;
        border-radius: 5px;
        font-size: 16px;
        height: min-content;
        margin: 0;
    }

    /* if the added attributed contains an image remove 4px padding to account for the extra space created by the svg */
    .added-attribute img {
        margin-right: -4px;
        padding: 0;
    }
</style>