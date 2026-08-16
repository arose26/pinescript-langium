import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['test/**/*.test.ts'],
        setupFiles: ['test/setup.ts'],
        // Building the Langium services and transpiling every example file is
        // slower than a typical unit test; the golden-file suite needs headroom.
        testTimeout: 30_000,
        hookTimeout: 30_000
    }
});
