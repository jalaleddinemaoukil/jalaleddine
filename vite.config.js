import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const projectId = env.VITE_SANITY_PROJECT_ID ?? "5x33ctz8";
  const dataset = env.VITE_SANITY_DATASET ?? "production";
  const apiVersion = "2023-10-01";
  const token = env.SANITY_TOKEN;
  const apiHost = env.VITE_SANITY_API_HOST ?? env.SANITY_API_HOST ?? "api.sanity.io";

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      proxy: {
        "/api/sanity": {
          target: `https://${projectId}.${apiHost}`,
          changeOrigin: true,
          secure: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          rewrite: (path) =>
            path.replace(/^\/api\/sanity/, `/v${apiVersion}/data/query/${dataset}`),
        },
      },
    },
    build: {
      cssCodeSplit: true,
      minify: "esbuild",
      target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/lenis/")) return "lenis";
          },
        },
      },
    },
  };
});
