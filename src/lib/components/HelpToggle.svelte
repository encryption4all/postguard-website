<script lang="ts">
    interface props {
        title: string;
        content: string;
        bordered?: boolean;
        linkText?: string;
        linkUrl?: string;
    }

    let { title, content, bordered = false, linkText, linkUrl }: props = $props()
</script>

<details class="help-section" class:bordered>
    <summary class="help-toggle">
        <span class="arrow">▶</span>
        <span class="toggle-label">{title}</span>
    </summary>
    <div class="help-content">
        <p class="help-text">{content}</p>
        {#if linkText && linkUrl}
            <a href={linkUrl} target="_blank" rel="noopener noreferrer" class="help-link">
                {linkText} →
            </a>
        {/if}
    </div>
</details>

<style>
    .help-section {
        width: 100%;
        box-sizing: border-box;
        min-width: 0;
        overflow: clip;
        overflow-clip-margin: 4px;
    }

    .help-section.bordered {
        background: transparant;
        border: 1px solid var(--pg-strong-background);
        border-radius: var(--pg-border-radius-lg);
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

    .help-toggle:focus-visible {
        outline: 2px solid var(--pg-primary);
        outline-offset: 2px;
        border-radius: var(--pg-border-radius-sm);
        position: relative;
        z-index: 1;
    }

    .help-section.bordered .help-toggle {
        padding: 0.5rem 1rem;
    }

    .arrow {
        font-size: var(--pg-font-size-xs);
        color: var(--pg-text-secondary);
        transition: transform 0.2s ease;
        display: inline-block;
    }

    details[open] .arrow {
        transform: rotate(90deg);
    }

    .toggle-label {
        font-size: var(--pg-font-size-sm);
        color: var(--pg-text-secondary);
        font-weight: var(--pg-font-weight-medium);
    }

    .help-content {
        margin: 0 1rem 1rem 1.2rem;
    }

    .help-section.bordered .help-content {
        margin: 0 1rem 1rem 2.2rem;
    }

    .help-text {
        font-size: var(--pg-font-size-sm);
        color: var(--pg-text-secondary);
        font-family: var(--pg-font-family);
        line-height: 1.5;
        margin: 0;
    }

    .help-link {
        display: inline-block;
        font-size: var(--pg-font-size-sm);
        color: var(--pg-primary);
        font-family: var(--pg-font-family);
        font-weight: var(--pg-font-weight-medium);
        text-decoration: none;
        margin-top: 0.5rem;
        transition: color 0.2s ease;
    }

    .help-link:hover {
        color: var(--pg-primary-contrast);
        text-decoration: underline;
    }
</style>
