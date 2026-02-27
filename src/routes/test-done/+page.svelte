<script lang="ts">
    import { dev } from '$app/environment'
    import { goto } from '$app/navigation'
    import Done from '$lib/components/filesharing/Done.svelte'
    import { EncryptionState } from '$lib/types/filesharing/attributes'

    // Redirect to home if not in development mode
    if (!dev) {
        goto('/')
    }

    // Hardcoded test data
    let testEncryptState = $state({
        stage: EncryptionState.Done,
        files: [
            new File([''], 'presentation.pdf', { type: 'application/pdf', lastModified: Date.now() }),
            new File([''], 'budget_2024_final_version_v3.xlsx', { type: 'application/vnd.ms-excel', lastModified: Date.now() }),
            new File([''], 'team_photo.jpg', { type: 'image/jpeg', lastModified: Date.now() }),
            new File([''], 'contract_signed.docx', { type: 'application/msword', lastModified: Date.now() }),
        ],
        recipients: [
            {
                email: 'jan.janssen@example.com',
                extra: []
            },
            {
                email: 'marie.pietersen@company.nl',
                extra: [
                    { t: 'pbdf.sidn-pbdf.mobilenumber.mobilenumber', v: '+31612345678' }
                ]
            },
            {
                email: 'test.user@domain.com',
                extra: [
                    { t: 'pbdf.sidn-pbdf.mobilenumber.mobilenumber', v: '+31687654321' },
                    { t: 'pbdf.gemeente.personalData.fullname', v: 'Test User' }
                ]
            },
            {
                email: 'another.recipient@example.org',
                extra: [
                    { t: 'pbdf.gemeente.personalData.fullname', v: 'Another Recipient' }
                ]
            }
        ],
        sender: [],
        senderConfirm: false,
        message: 'Test message',
        done: [],
        percentages: []
    })

    function createDefaultEncryptState() {
        return {
            stage: EncryptionState.FileSelection,
            files: [],
            recipients: [{ email: '', extra: [] }],
            sender: [],
            senderConfirm: false,
            message: '',
            done: [],
            percentages: []
        }
    }
</script>

<!-- Mirrors the .done wrapper from +page.svelte -->
<div class="done">
    <Done
        bind:EncryptState={testEncryptState}
        {createDefaultEncryptState}
    />
</div>

<style>
    .done {
        display: flex;
        flex-direction: column;
        flex: 1;
    }
</style>
