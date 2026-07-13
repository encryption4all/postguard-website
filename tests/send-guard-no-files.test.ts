import { expect, test } from '@playwright/test'

// Regression tests for encryption4all/postguard-website#290 (July 2026 user
// test): a message could be sent before any file was attached, and nothing
// told the user to attach a file first.
//
// A fileless message is never valid, so with zero attachments:
//  - the send button must be marked aria-disabled (it stays clickable so the
//    validation modal can explain what is missing, per #300), and
//  - a clear empty-state prompt must be visible telling the user to attach a
//    file first, wired to the send button via aria-describedby.

test.beforeEach(async ({ page }) => {
    await page.goto('/fileshare/')
    await expect(
        page.getByRole('textbox', { name: /email address/i })
    ).toBeVisible()
})

test('send button is inactive and points at the attach-file prompt when no files are attached', async ({
    page,
}) => {
    const sendButton = page.locator('button.send-btn')
    await expect(sendButton).toBeVisible()
    await expect(sendButton).toHaveAttribute('aria-disabled', 'true')

    const prompt = page.locator('#attach-file-prompt')
    await expect(prompt).toBeVisible()
    await expect(prompt).toContainText(/attach at least one file/i)

    // Screen readers must learn why the button is inactive.
    await expect(sendButton).toHaveAttribute(
        'aria-describedby',
        'attach-file-prompt'
    )
})

test('clicking send with no files opens the validation modal explaining a file is missing', async ({
    page,
}) => {
    // The button is only aria-disabled, not natively disabled, so a real user
    // can still click it (which surfaces the validation modal). force past
    // Playwright's aria-disabled actionability guard to mimic that click.
    await page.locator('button.send-btn').click({ force: true })

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText(/haven't added any files/i)
})
