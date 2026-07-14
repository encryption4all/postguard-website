import { defineConfig } from 'vitest/config'

// The current unit tests cover pure TypeScript helpers with no Svelte
// imports, so no SvelteKit Vite plugin is needed. Keeping the config
// minimal also avoids depending on `svelte-kit sync` having run first.
export default defineConfig({
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}'],
        environment: 'node',
    },
})
