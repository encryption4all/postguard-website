import { sveltekit } from '@sveltejs/kit/vite'
import type { UserConfig } from 'vite'

const config: UserConfig = {
  server: {
    fs: {
      allow: ['..']
    },
    // Polling mode so Claude Code file changes are picked up by the HMR watcher
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
  plugins: [sveltekit()],
}

export default config
