import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const basePlugins = [react(), tailwindcss()];
  
  const plugins = mode === 'analyze' 
    ? [...basePlugins, visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true
      })]
    : basePlugins;

  return {
    plugins,
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            antd: ['antd', '@ant-design/icons', '@ant-design/pro-components'],
            charts: ['echarts', 'echarts-for-react']
          }
        }
      }
    }
  };
});
