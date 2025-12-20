import type { NextConfig } from 'next';
const API_HOST = process.env.API_HOST || 'http://127.0.0.1:8000';
const nextConfig: NextConfig = {
  output: "standalone",
  // 讓 Next.js 知道這個變數要在 BUILD TIME 注入
  // 你可以給一個本地備用值，但最終 Docker 會覆蓋它
  env: {
    API_HOST: API_HOST,
  },
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // ⭐ 關鍵修正：從環境變數 API_HOST 讀取目標地址
        destination: `${API_HOST}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;