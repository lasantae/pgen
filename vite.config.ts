import { defineConfig } from 'vite';

export default defineConfig({
    base: "/pgen",
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                sw: 'src/serviceworker/sw.ts'
            },
            output: {
                entryFileNames: (assetInfo) => {
                    if (assetInfo.name === 'sw') {
                        return 'sw.js';
                    }
                    return 'assets/[name]-[hash].js';
                }
            }
        }
    }
});
