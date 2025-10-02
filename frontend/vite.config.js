import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // Exit if port 5173 is already in use
    host: true, // Listen on all addresses
  },
  optimizeDeps: {
    include: ["flowbite-react"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["flowbite-react", "react-icons"],
          utils: ["axios", "formik", "yup"],
        },
      },
    },
  },
});
