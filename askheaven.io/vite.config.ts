
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const rootEnv = loadEnv(mode, process.cwd(), '');
  // Also attempt to load env from 'services' directory in case it was created there
  const servicesEnv = loadEnv(mode, path.resolve(process.cwd(), 'services'), '');
  
  // Merge: Root env takes precedence, then services env, then system env
  const mergedEnv = { ...process.env, ...servicesEnv, ...rootEnv };

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
