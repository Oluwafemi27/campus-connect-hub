import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [TanStackRouterVite(), react(), tailwindcss(), tsconfigPaths()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "@tanstack/react-router"],
          ui: ["lucide-react", "sonner", "@radix-ui/react-dialog"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
    cssCodeSplit: true,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    target: "ES2022",
  },
  server: {
    preTransformRequests: true,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "@tanstack/react-router", "@supabase/supabase-js"],
  },
});
