<script lang="ts">
    interface props {
        text: string;
        onclick?: () => void;
        size?: 'sm' | 'md' | 'lg';
        variant?: 'default' | 'filled' | 'dark';
        icon?: '+' | '×' | null;
        disabled?: boolean;
    }

    let {
        text,
        onclick,
        size = 'md',
        variant = 'default',
        icon = null,
        disabled = false
    }: props = $props()

    const isInteractive = onclick !== undefined
</script>

{#if isInteractive}
    <button
        class="chip"
        class:chip-sm={size === 'sm'}
        class:chip-md={size === 'md'}
        class:chip-lg={size === 'lg'}
        class:chip-default={variant === 'default'}
        class:chip-filled={variant === 'filled'}
        class:chip-dark={variant === 'dark'}
        {onclick}
        {disabled}
        type="button"
    >
        {#if icon}<span class="chip-icon">{icon}</span>{/if}<span class="chip-text">{text}</span>
    </button>
{:else}
    <span
        class="chip chip-static"
        class:chip-sm={size === 'sm'}
        class:chip-md={size === 'md'}
        class:chip-lg={size === 'lg'}
        class:chip-default={variant === 'default'}
        class:chip-filled={variant === 'filled'}
        class:chip-dark={variant === 'dark'}
    >
        {#if icon}<span class="chip-icon">{icon}</span>{/if}<span class="chip-text">{text}</span>
    </span>
{/if}

<style>
    .chip {
        all: unset;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.35em;
        border-radius: var(--pg-border-radius-md);
        font-family: var(--pg-font-family);
        color: var(--pg-text-primary);
        transition: all 0.2s ease;
        box-sizing: border-box;
        white-space: nowrap;
        width: fit-content;
    }

    .chip-icon,
    .chip-text {
        display: inline-block;
    }

    /* Interactive chips (buttons) */
    button.chip {
        cursor: pointer;
    }

    button.chip:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    /* Static chips (non-interactive) */
    .chip-static {
        cursor: default;
    }

    /* Size variants */
    .chip-sm {
        padding: 0px 8px;
        font-size: 0.85rem;
    }

    .chip-md {
        padding: 2px 10px;
        font-size: 0.9rem;
    }

    .chip-lg {
        padding: 0.2em 1em;
        font-size: 0.95em;
    }

    /* Variant: default (white background, light border) */
    .chip-default {
        background-color: var(--pg-general-bg);
        border: 1.5px solid var(--pg-border-color);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    button.chip-default:hover:not(:disabled) {
        background-color: #f9fafb;
        border-color: var(--pg-accent-color);
        color: var(--pg-accent-color);
        box-shadow: 0 2px 4px rgba(48, 149, 222, 0.15);
    }

    /* Variant: filled (gray background) */
    .chip-filled {
        background-color: #e5e7eb;
        border: 1px solid var(--pg-border-color);
    }

    button.chip-filled:hover:not(:disabled) {
        background-color: #fee2e2;
        border-color: #fca5a5;
        color: #991b1b;
    }

    /* Variant: dark (black border, for close buttons) */
    .chip-dark {
        background-color: transparant;
        border: 1px solid --pg-text-primary;
    }

    button.chip-dark:hover:not(:disabled) {
        background-color: #f9fafb;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
</style>
