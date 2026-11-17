import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// 개발 중에는 /api, /uploads 요청을 백엔드(4000)로 넘겨 같은 출처처럼 동작하게 한다.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
    },
  },
  build: {
    // 화면마다 필요한 코드만 내려받도록 페이지는 따로 나누고(React.lazy),
    // 자주 바뀌지 않는 라이브러리는 한 덩어리로 묶어 오래 캐시되게 한다.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router)[\\/]/.test(id)) return 'react-vendor';
          if (id.includes('axios')) return 'http-vendor';
          return undefined;
        },
      },
    },
  },
});
