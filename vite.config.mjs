import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import jsconfigPaths from 'vite-jsconfig-paths';

export default defineConfig(({ mode }) => {
    // depending on your application, base can also be "/"
    const env = loadEnv(mode, process.cwd(), '');
    const API_URL = `${env.VITE_APP_BASE_NAME}`;
    const PORT = process.env.PORT || env.PORT || 5174;

    return {
        server: {
            // this ensures that the browser opens upon server start
            open: false,
            // this sets a default port to 5174
            port: Number(PORT),
            host: true
        },
        build: {
            chunkSizeWarningLimit: 1600
        },
        preview: {
            open: true,
            host: true
        },
        define: {
            global: 'window'
        },
        resolve: {
            alias: {
                '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs'
            }
        },
        base: API_URL,
        plugins: [react(), tailwindcss(), jsconfigPaths()]
    };
});
