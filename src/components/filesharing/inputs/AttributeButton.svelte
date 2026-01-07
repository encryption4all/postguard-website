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
        color: #374151;
        border: 1.5px solid #d1d5db;
        border-radius: 6px;
        background-color: white;
        font-family: Overpass;
        cursor: pointer;
        padding: 6px 10px;
        font-size: 14px;
        transition: all 0.2s ease;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .add-attribute-btn:hover {
        background-color: #f9fafb;
        border-color: #3095de;
        color: #3095de;
        box-shadow: 0 2px 4px rgba(48, 149, 222, 0.1);
    }

    .added-attribute {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #374151;
        background-color: #e5e7eb;
        border: 1px solid #d1d5db;
        font-family: Overpass;
        text-align: start;
        width: fit-content;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 14px;
        height: min-content;
        margin: 0;
        transition: all 0.2s ease;
        cursor: pointer;
    }

    .added-attribute:hover {
        background-color: #fee2e2;
        border-color: #fca5a5;
        color: #991b1b;
    }

    .added-attribute img {
        width: 16px;
        height: 16px;
    }
</style>