import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [sveltekit()],

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
        @use "src/lib/styles/variables/color.scss" as *;
        @use "src/lib/styles/variables/font.scss" as *;
        `.trim(),
      },
    },
  },
});
