import os
import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from rag import get_rag_chain, initialize_vector_db

# 載入環境變數
load_dotenv()

app = FastAPI()

# --- CORS 設定 ---
# 這讓你的 Next.js (localhost:3000) 可以呼叫這個後端 (localhost:8000)
origins = [
    "http://localhost",          # 本地測試用
    "http://localhost:3000",     # 本地前端開發用 (Next.js)
    "http://123.45.67.89",       # 你的 Lightsail Public IP (還沒買網域前)
    "https://your-domain.com",   # 之後買了網域要加上這行
]

app.add_middleware(
    CORSMiddleware,
    # 改成讀取上面的清單，而不是 ["*"]
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 定義請求格式 ---
class ChatRequest(BaseModel):
    query: str
    token: str  # 這是 Cloudflare 給的驗證碼

# --- 全域變數 ---
rag_chain = None
CLOUDFLARE_SECRET_KEY = os.getenv("CLOUDFLARE_SECRET_KEY")

@app.on_event("startup")
async def startup_event():
    """伺服器啟動時執行：初始化 RAG"""
    global rag_chain
    print("🚀 後端啟動中...")
    
    # 這裡可以選擇是否每次啟動都重建索引，或者只讀取現有的
    # 簡單起見，如果 DB 存在就直接讀取
    try:
        rag_chain = get_rag_chain()
        if rag_chain:
            print("✅ RAG 引擎已就緒")
        else:
            print("⚠️ RAG 引擎初始化失敗 (可能是沒有資料)")
    except Exception as e:
        print(f"❌ RAG 初始化錯誤: {e}")

async def verify_turnstile(token: str) -> bool:
    """驗證 Cloudflare Turnstile Token"""
    url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
    data = {
        "secret": CLOUDFLARE_SECRET_KEY,
        "response": token
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, data=data)
        result = response.json()
        return result.get("success", False)

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """聊天接口：改為串流輸出"""
    
    # 1. 驗證 Cloudflare (這部分邏輯不變，先驗證是不是人類)
    if CLOUDFLARE_SECRET_KEY:
        is_human = await verify_turnstile(request.token)
        if not is_human:
            raise HTTPException(status_code=403, detail="Cloudflare verification failed.")

    if not rag_chain:
        raise HTTPException(status_code=503, detail="RAG system not initialized yet.")

    # 2. 定義一個產生器 (Generator)，用來一個字一個字吐資料
    async def generate_response():
        try:
            # 使用 .astream (Async Stream)
            # LangChain 的 Retrieval Chain 會回傳很多步驟的資訊 (包含檢索到的文件等)
            # 我們只需要過濾出 "answer" 的部分
            async for chunk in rag_chain.astream({"input": request.query}):
                
                # 檢查這個 chunk 是否包含回答內容
                if "answer" in chunk:
                    # chunk["answer"] 可能是字串片段
                    content = chunk["answer"]
                    if content:
                        yield content  # <--- 這裡即時把文字推給前端

        except Exception as e:
            print(f"Stream Error: {e}")
            yield f"Error: {str(e)}"

    # 3. 回傳 StreamingResponse
    # media_type="text/event-stream" 是標準的 Server-Sent Events (SSE) 格式
    return StreamingResponse(generate_response(), media_type="text/event-stream")

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Rudy's Backend is running!"}

# 啟動指令: uvicorn main:app --reload --port 8000