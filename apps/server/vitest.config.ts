import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: './src/test/global-setup.ts',
    // Tests share one SQLite test db — keep them in a single worker.
    fileParallelism: false,
  },
})
