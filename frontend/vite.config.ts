import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 5173,
      proxy: env.VITE_API_BASE_URL
        ? undefined
        : {
            '/api': {
              target: 'http://localhost:3000',
              changeOrigin: true,
            },
          },
    },
  };
});
