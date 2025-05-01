import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/features/simple-test.ts', 'test/features/pca-test.ts'],
    exclude: ['test/features/complex-features.test.ts']
  }
});
