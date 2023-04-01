import tsconfigPaths from 'vite-tsconfig-paths'
import { VitePWA } from 'vite-plugin-pwa'

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
                name: 'Polymorph',
                short_name: 'Polymorph',
                description: 'Recursive List Todo App.',
                theme_color: '#ffffff',
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
                background_color: "#ffffff",
                display: "standalone"
            },
            devOptions: {
                enabled: true
            }
        })
    ],
    resolve: {
        alias: {
            // Solve sanitize-html complaints
            "url": "./src/.junk/builtins_placeholder.tsx",
            "path": "./src/.junk/builtins_placeholder.tsx",
            "source-map-js": "./src/.junk/builtins_placeholder.tsx",
            "fs": "./src/.junk/builtins_placeholder.tsx"
        }
    }
}