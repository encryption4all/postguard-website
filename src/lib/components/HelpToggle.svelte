<script lang="ts">
    interface props {
        title: string;
        content: string;
        bordered?: boolean;
    }

    let { title, content, bordered = false }: props = $props()
    let expanded = $state(false)
</script>

<div class="help-section" class:bordered>
    <button class="help-toggle" type="button" onclick={() => expanded = !expanded}>
        <span class="arrow" class:expanded>▶</span>
        <span class="toggle-label">{title}</span>
    </button>
    {#if expanded}
        <p class="help-text">{content}</p>
    {/if}
</div>

<style>
    .help-section {
        width: 100%;
    }

    .help-section.bordered {
        background: white;
        border: 2px solid var(--pg-border-color-light);
        border-radius: var(--pg-border-radius-lg);
        /* padding: 1rem 1.5rem; */
        box-shadow: 0 2px 8px rgba(48, 149, 222, 0.08);
    }

    .help-toggle {
        all: unset;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        user-select: none;
        background: transparent;
        font-family: var(--pg-font-family);
        padding: 0.5rem 1rem;

    }

    .arrow {
        font-size: 0.7rem;
        color: var(--pg-text-secondary);
        transition: transform 0.2s ease;
        display: inline-block;
    }

    .arrow.expanded {
        transform: rotate(90deg);
    }

    .toggle-label {
        font-size: 0.9rem;
        color: var(--pg-text-secondary);
        font-weight: 600;
    }

    .help-text {
        font-size: 0.85rem;
        color: var(--pg-text-secondary);
        font-family: var(--pg-font-family);
        line-height: 1.5;
        margin: 0rem 0 0.5rem 1.5rem;
    }
</style>
