<script lang="ts">
    import { _, format } from 'svelte-i18n'
    import type { AttributeCon } from '@e4a/pg-wasm'
    import getTranslation from '../../../cryptify/cryptify-front-end/src/Translations'

    interface props {
        encryptStartTime: number
        files: File[]
        recipients: { email: string; extra: AttributeCon }[]
        percentages: number[]
    }

    let {encryptStartTime, files, recipients, percentages}: props = $props()

    const to = recipients.map(({ email }) => email).join(", ");
    let timeEstimateRepr = $derived(() => {
        const deltaT = Date.now() - encryptStartTime;
        const totalSize = files
            .map((f) => f.size)
            .reduce((a, b) => a + b, 0);

        const totalProgress = files
            .map((f, i) => (percentages[i] * f.size) / totalSize)
            .reduce((a, b) => a + b, 0);

        if (deltaT > 1000 && totalProgress > 1) {
            const remainingProgress = 100 - totalProgress;
            const estimatedT = remainingProgress * (deltaT / totalProgress);
            return getTranslationForTime(estimatedT);
        }
        return $_('filesharing.encryptPanel.timeremaining.estimate');
    });

    function getTranslationForTime(remaining: number): string {
        switch (true) {
            case remaining < 1000 * 60:
                return $_('filesharing.encryptPanel.timeremaining.seconds');
            case remaining < 1000 * 60 * 60:
                const minutes = Math.ceil(remaining / (1000 * 60));
                return $_('filesharing.encryptPanel.timeremaining.minutes',
                    { values: { minutes: minutes } });
            case remaining < 1000 * 60 * 60 * 24:
                const hours = Math.ceil(remaining / (1000 * 60 * 60));
                return $_('filesharing.encryptPanel.timeremaining.hours',
                    { values: { hours: hours } });
            default:
                return $_('filesharing.encryptPanel.timeremaining.unknown');
        }
    }

    function onCancel(e: Event): void {
        e.preventDefault();

    }
</script>

<h3>{$_('filesharing.encryptPanel.encrypting')}</h3>
<p>
    {$_('filesharing.encryptPanel.encryptingInfo')}
    <a href={`mailto:${to}`}>{to}</a>
</p>
<p>{timeEstimateRepr}</p>

<button
    class="crypt-btn crypt-btn-secondary crypt-btn-cancel"
    onclick={(e) => onCancel(e)}
    type="button"
>
    {$_('filesharing.encryptPanel.cancel')}
</button>