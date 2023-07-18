import tsconfigPaths from 'vite-tsconfig-paths'
import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'

export default {
    plugins: [
        tsconfigPaths(),
        VitePWA({
            registerType: 'autoUpdate',
            strategies: "generateSW",
            injectRegister: 'auto',
            // Kudos to the service provided by https://realfavicongenerator.net/.
            includeAssets: ["icon-128.png"],
            manifest: {
                name: 'Workflowish',
                short_name: 'Workflowish',
                description: 'Recursive List Todo App.',
                icons: [
                    {
                        "src": "/android-chrome-192x192.png",
                        "sizes": "192x192",
                        "type": "image/png"
                    },
                    {
                        "src": "/android-chrome-512x512.png",
                        "sizes": "512x512",
                        "type": "image/png",
                        "purpose": "any maskable"
                    }
                ],
                "theme_color": "#8365b5",
                "background_color": "#8365b5",
                "display": "standalone"
            },
            devOptions: {
                enabled: true
            }
        }),
        react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
    ],
    resolve: {
        alias: {
            // Solve sanitize-html complaints
            "url": "./src/util/builtins_placeholder.tsx",
            "path": "./src/util/builtins_placeholder.tsx",
            "source-map-js": "./src/util/builtins_placeholder.tsx",
            "fs": "./src/util/builtins_placeholder.tsx"
        }
    }
}