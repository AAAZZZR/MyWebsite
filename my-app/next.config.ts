import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 其他設定 (例如 reactStrictMode: true 等) 可以保留
  
  // 核心重點：Rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // 開發環境轉發到 FastAPI
        destination: 'http://127.0.0.1:8000/:path*', 
      },
    ];
  },
};

export default nextConfig;