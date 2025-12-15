# 1. 基礎映像檔
FROM node:25-alpine AS base

# 安裝 libc6-compat (解決 alpine 系統對某些 Next.js 套件的相容性問題)
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 2. 依賴安裝階段
FROM base AS deps
COPY package.json package-lock.json ./
# 使用 ci 安裝，比 install 更快更乾淨
RUN npm ci

# 3. 建置階段 (Builder)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG API_HOST
ENV API_HOST=$API_HOST
# 這行執行時，會因為我們改了 next.config.js 而產生極小的 standalone 包
RUN npm run build

# 4. 執行階段 (Runner) - 最終產物
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# 關閉遙測數據
ENV NEXT_TELEMETRY_DISABLED 1

# 建立非 root 使用者 (安全性)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 複製必要的靜態資源
COPY --from=builder /app/public ./public

# [關鍵] 只複製 standalone 資料夾，這裡面已經包含了必要的 node_modules
# 不用再另外 COPY node_modules 了
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 切換使用者
USER nextjs

EXPOSE 3000

ENV PORT 3000
# 注意：Standalone 模式下，啟動指令是 node server.js
CMD ["node", "server.js"]