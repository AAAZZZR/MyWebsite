import os
import httpx
import threading  # ✅ 新增
import schedule   # ✅ 新增
import time       # ✅ 新增
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from rag import get_rag_chain, initialize_vector_db
import NEWS 
from NEWS import rss_manager

load_dotenv()

app = FastAPI()
app.include_router(NEWS.router)

origins = [
    "http://localhost",          # 本地測試用
    "http://localhost:3000",     # 本地前端開發用 (Next.js)
    "http://3.25.200.182",       # 你的 Lightsail Public IP (還沒買網域前)
    "https://leverag.xyz/",   
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
    mode: str = "hr"
    #token: str  

# --- 全域變數 ---
rag_chains = {
    "hr": None,
    "client": None
}
CLOUDFLARE_SECRET_KEY = os.getenv("CLOUDFLARE_SECRET_KEY")

def run_scheduler():
    """這是要在獨立執行緒跑的迴圈"""
    while True:
        schedule.run_pending()
        time.sleep(1)

def start_background_tasks():
    """設定排程並啟動執行緒"""
    # 1. 設定每 15 分鐘跑一次 update_all_feeds
    schedule.every(15).minutes.do(rss_manager.update_all_feeds)
    
    # 2. 為了開發方便，啟動時先馬上跑一次 (不然你要等15分鐘才看到資料)
    # 注意：這會稍微拖慢啟動速度，但能確保 Redis 馬上有資料
    try:
        print("Running initial RSS fetch...")
        rss_manager.update_all_feeds()
    except Exception as e:
        print(f"Initial fetch failed: {e}")

    # 3. 啟動背景執行緒
    thread = threading.Thread(target=run_scheduler, daemon=True)
    thread.start()
    print("Background scheduler started.")
    
@app.on_event("startup")
async def startup_event():
    """伺服器啟動時執行：預先初始化兩種模式的 RAG"""
    global rag_chains
    try:
        print("⚙️ Initializing RAG Chains...")
        
        # 初始化 HR 模式
        rag_chains["hr"] = get_rag_chain(mode='hr')
        print("✅ HR Mode: Ready")

        # 初始化 Client 模式
        rag_chains["client"] = get_rag_chain(mode='client')
        print("✅ Client Mode: Ready")
        start_background_tasks()
        if not rag_chains["hr"] or not rag_chains["client"]:
            print("⚠️ Warning: One or more chains failed to load.")
            
    except Exception as e:
        print(f"❌ RAG Initialization Failed: {e}")

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

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """聊天接口：支援模式切換與串流輸出"""
    
    # Cloudflare 驗證邏輯 (暫時註解)
    # if CLOUDFLARE_SECRET_KEY:
    #     is_human = await verify_turnstile(request.token)
    #     if not is_human:
    #         raise HTTPException(status_code=403, detail="Cloudflare verification failed.")

    # --- 3. 根據請求選擇對應的 Chain ---
    # 如果 request.mode 是 'client' 就拿 client chain，否則預設拿 hr chain
    selected_mode = request.mode if request.mode in ["client", "hr"] else "hr"
    active_chain = rag_chains.get(selected_mode)

    if not active_chain:
        # 如果該模式的 Chain 沒跑起來，嘗試用 HR 當備案，真的都沒有才報錯
        active_chain = rag_chains.get("hr")
        if not active_chain:
            raise HTTPException(status_code=503, detail="RAG system is currently unavailable.")

    # 4. 定義產生器
    async def generate_response():
        try:
            # 使用選定的 Chain 進行問答
            async for chunk in active_chain.astream({"input": request.query}):
                
                if "answer" in chunk:
                    content = chunk["answer"]
                    if content:
                        yield content 

        except Exception as e:
            print(f"Stream Error: {e}")
            yield f"Error: {str(e)}"

    print(f"📩 Query: {request.query} | 🎭 Mode: {selected_mode}")
    
    return StreamingResponse(generate_response(), media_type="text/event-stream")

@app.get("/api/")
def health_check():
    return {"status": "ok", "message": "Rudy's Backend is running!"}


