import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [TanStackRouterVite(), react(), tailwindcss(), tsconfigPaths()],
  build: {
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: false,
        passes: 2,
      },
      format: {
        comments: false,
      },
    },
    chunkSizeWarningLimit: 800,
    sourcemap: false,
    target: "ES2022",
    reportCompressedSize: false,
  },
  server: {
    preTransformRequests: true,
    middlewareMode: false,
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@tanstack/react-router",
      "@supabase/supabase-js",
      "lucide-react",
      "@radix-ui/react-dialog",
      "sonner",
      "recharts",
    ],
    exclude: ["vite"],
  },
  ssr: {
    external: ["@supabase/supabase-js"],
  },
});
