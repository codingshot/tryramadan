import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './expo-e2e',
  workers: 1,
  use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:8091' },
  webServer: {
    command: 'vite preview --outDir ../mobile/dist --host 127.0.0.1 --port 8091 --strictPort',
    url: 'http://127.0.0.1:8091',
    reuseExistingServer: false,
  },
});
