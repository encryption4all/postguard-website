import { sveltekit } from '@sveltejs/kit/vite'
import type { UserConfig } from 'vite'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

const config: UserConfig = {
    resolve: {
        alias: {
            util: 'rollup-plugin-node-polyfills/polyfills/util',
            events: 'rollup-plugin-node-polyfills/polyfills/events',
            url: 'rollup-plugin-node-polyfills/polyfills/url',
            http: 'rollup-plugin-node-polyfills/polyfills/http',
            https: 'rollup-plugin-node-polyfills/polyfills/http',
        },
    },

    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    process: true,
                    buffer: true,
                }),
                NodeModulesPolyfillPlugin(),
            ],
        },
    },

    plugins: [
        sveltekit(),
        wasm(),
        topLevelAwait()
    ],
}

export default config
