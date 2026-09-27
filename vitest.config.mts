import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // Resolve the "@/..." alias from tsconfig.json
    tsconfigPaths: true,
  },
  test: {
    // Pure logic runs in Node; files that need localStorage opt into jsdom with a docblock
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
