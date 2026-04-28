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
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("@tanstack/react-router")
            ) {
              return "vendor-react";
            }
            if (id.includes("@radix-ui") || id.includes("lucide-react")) {
              return "vendor-ui";
            }
            if (id.includes("@supabase")) {
              return "vendor-supabase";
            }
            if (id.includes("sonner") || id.includes("recharts")) {
              return "vendor-misc";
            }
            return "vendor-other";
          }
        },
      },
    },
    cssCodeSplit: true,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
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
