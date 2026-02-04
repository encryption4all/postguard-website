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
            {clickAction ? '+' : ''} {$_(translation_key)} 
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
        all: unset;
        color: var(--pg-text-primary);
        border: 1.5px solid var(--pg-border-color);
        border-radius: var(--pg-border-radius);
        background-color: white;
        font-family: var(--pg-font-family);
        cursor: pointer;
        padding: 6px 10px;
        font-size: 14px;
        transition: all 0.2s ease;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        box-sizing: border-box;
    }

    .add-attribute-btn:hover {
        background-color: #f9fafb;
        border-color: var(--pg-accent-color);
        color: var(--pg-accent-color);
        box-shadow: 0 2px 4px rgba(var(--pg-accent-color-rgb), 0.1);
    }

    .added-attribute {
        all: unset;
        display: flex;
        align-items: center;
        gap: 4px;
        color: var(--pg-text-primary);
        background-color: #e5e7eb;
        border: 1px solid var(--pg-border-color);
        font-family: var(--pg-font-family);
        text-align: start;
        width: fit-content;
        padding: 6px 10px;
        border-radius: var(--pg-border-radius);
        font-size: 14px;
        height: min-content;
        margin: 0;
        transition: all 0.2s ease;
        cursor: pointer;
        box-sizing: border-box;
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
