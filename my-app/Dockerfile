# 建立階段 (Builder)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# 執行階段 (Runner) - 只留需要的檔案以縮小體積
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# 複製 build 好的檔案
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]