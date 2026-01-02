import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const basePlugins = [react(), tailwindcss()];

  const plugins =
    mode === 'analyze'
      ? [
          ...basePlugins,
          visualizer({
            filename: 'dist/stats.html',
            open: true,
            gzipSize: true,
            brotliSize: true,
          }),
        ]
      : basePlugins;

  return {
    plugins,
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-router': ['react-router'],
            'vendor-antd-core': ['antd/es/button', 'antd/es/card', 'antd/es/layout', 'antd/es/menu', 'antd/es/select'],
            'vendor-antd-form': ['antd/es/form', 'antd/es/input', 'antd/es/checkbox'],
            'vendor-antd-table': ['antd/es/table', 'antd/es/pagination'],
            'vendor-antd-modal': ['antd/es/modal', 'antd/es/drawer', 'antd/es/descriptions'],
            'vendor-antd-upload': ['antd/es/upload', 'antd/es/message'],
            'vendor-antd-icons': ['@ant-design/icons'],
            'vendor-antd-pro': ['@ant-design/pro-components'],
            'vendor-charts-basic': ['echarts/core', 'echarts/renderers', 'echarts/charts'],
            'vendor-charts-components': ['echarts/components', 'echarts/features'],
            'vendor-charts-react': ['echarts-for-react'],
            'vendor-utils': ['file-saver', 'jszip'],
            'vendor-forms': ['react-hook-form'],
          },
        },
      },
    },
  };
});
