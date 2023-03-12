import tsconfigPaths from 'vite-tsconfig-paths'

export default {
    plugins: [tsconfigPaths()],
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