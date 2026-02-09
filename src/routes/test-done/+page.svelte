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

    let defaultEncryptState = {
        stage: EncryptionState.FileSelection,
        files: [],
        recipients: [{ email: '', extra: [] }],
        sender: [],
        senderConfirm: false,
        message: '',
        done: [],
        percentages: []
    }
</script>

<div class="test-container">
    <!-- <div class="test-header">
        <h1>Test: Done Component</h1>
        <p>This is a test page to preview the Done component with hardcoded data.</p>
    </div> -->

    <Done
        bind:EncryptState={testEncryptState}
        {defaultEncryptState}
    />
</div>

<style>
    .test-container {
        min-height: 100vh;
        background: #fff;
        padding: 2rem;
    }

    .test-header {
        text-align: center;
        margin-bottom: 2rem;
        padding: 1rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .test-header h1 {
        margin: 0 0 0.5rem 0;
        color: #1f2937;
    }

    .test-header p {
        margin: 0;
        color: #6b7280;
    }
</style>
