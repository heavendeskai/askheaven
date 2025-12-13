
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Merge Vercel system env vars (process.env) with local .env vars (env)
  // This ensures variables set in the Vercel Dashboard are visible to the app
  const mergedEnv = { ...process.env, ...env };

  return {
    plugins: [react()],
    define: {
      // JSON.stringify is needed to correctly inject the object into the client bundle
      'process.env': JSON.stringify(mergedEnv)
    },
    build: {
      chunkSizeWarningLimit: 1600, // Increase limit to suppress size warnings
    },
    server: {
      port: 3000
    }
  };
});
