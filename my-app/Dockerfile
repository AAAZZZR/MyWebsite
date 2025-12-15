# 1. 使用 Node 官方映像檔
FROM node:18-alpine

# 2. 設定工作目錄
WORKDIR /app

# 3. 複製 package.json 並安裝依賴
COPY package.json package-lock.json ./
RUN npm install

# 4. 複製所有程式碼
COPY . .

# 5. [關鍵] 在這裡執行 Build，而不是在伺服器上指令列執行
RUN npm run build

# 6. 開放 Port (Next.js 預設是 3000)
EXPOSE 3000

# 7. 啟動命令
CMD ["npm", "start"]