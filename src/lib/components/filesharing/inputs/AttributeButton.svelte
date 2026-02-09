<script lang="ts">
    import { _ } from 'svelte-i18n'
    import Chip from '$lib/components/Chip.svelte'

    interface props {
        clickAction?: () => void;
        translation_key: string;
        type: 'add' | 'added';
    }

    let { clickAction, translation_key, type }: props = $props()
</script>

<Chip
    text={$_(translation_key)}
    onclick={clickAction}
    icon={type === 'add' ? '+' : null}
    size="md"
    variant={type === 'add' ? 'default' : 'filled'}
/>
