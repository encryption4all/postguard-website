<script lang="ts">
    interface props {
        title: string;
        content: string;
        bordered?: boolean;
        linkText?: string;
        linkUrl?: string;
    }

    let { title, content, bordered = false, linkText, linkUrl }: props = $props()
    let expanded = $state(false)
</script>

<div class="help-section" class:bordered>
    <button class="help-toggle" type="button" onclick={() => expanded = !expanded}>
        <span class="arrow" class:expanded>▶</span>
        <span class="toggle-label">{title}</span>
    </button>
    {#if expanded}
        <div class="help-content">
            <p class="help-text">{content}</p>
            {#if linkText && linkUrl}
                <a href={linkUrl} target="_blank" rel="noopener noreferrer" class="help-link">
                    {linkText} →
                </a>
            {/if}
        </div>
    {/if}
</div>

<style>
    .help-section {
        width: 100%;
        box-sizing: border-box;
    }

    .help-section.bordered {
        background: transparant;
        border: 1px solid var(--pg-strong-background);
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
        padding: 0.25rem 0;
    }

    .help-section.bordered .help-toggle {
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

    .help-content {
        margin: 0 1rem 1rem 1.2rem;
    }

    .help-section.bordered .help-content {
        margin: 0 1rem 1rem 2.2rem;
    }

    .help-text {
        font-size: 0.85rem;
        color: var(--pg-text-secondary);
        font-family: var(--pg-font-family);
        line-height: 1.5;
        margin: 0;
    }

    .help-link {
        display: inline-block;
        font-size: 0.85rem;
        color: var(--pg-primary);
        font-family: var(--pg-font-family);
        font-weight: 600;
        text-decoration: none;
        margin-top: 0.5rem;
        transition: color 0.2s ease;
    }

    .help-link:hover {
        color: var(--pg-primary-contrast);
        text-decoration: underline;
    }
</style>
