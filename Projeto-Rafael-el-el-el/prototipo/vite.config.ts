/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/testes/setup.ts'],
    // Fluxos completos de interface (digitação, várias telas) passam de 5 s com a suíte inteira em paralelo.
    testTimeout: 20000,
  },
});
