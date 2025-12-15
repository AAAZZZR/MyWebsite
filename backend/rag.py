import os
from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
# OpenAI 相關
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
# Google Gemini 相關
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
# 向量資料庫與 Chain
from langchain_chroma import Chroma
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

# 載入 .env
load_dotenv()


# 選項: "openai" 或 "gemini"
LLM_PROVIDER = "gemini" 

DATA_PATH = "./data"
# 自動根據模型區分資料庫路徑，避免向量維度衝突
DB_PATH = f"./vector_db_{LLM_PROVIDER}"

def get_embeddings():
    """根據設定回傳對應的 Embedding 模型"""
    if LLM_PROVIDER == "gemini":
        # 使用 Google 的 Embedding 模型
        return GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
    else:
        # 使用 OpenAI 的 Embedding 模型
        return OpenAIEmbeddings()

# rag.py

def get_llm():
    """根據設定回傳對應的 LLM 模型"""
    if LLM_PROVIDER == "gemini":
        return ChatGoogleGenerativeAI(
            model="gemini-2.5-flash", 
            temperature=0.7,
            convert_system_message_to_human=True,
            streaming=True  # <--- 加入這一行，明確告訴模型我們要串流
        )
    else:
        # OpenAI 也一樣建議加上
        return ChatOpenAI(
            model="gpt-4o-mini", 
            temperature=0.7, 
            streaming=True
        )

# ==========================================
# 🚀 核心邏輯
# ==========================================

def initialize_vector_db():
    """初始化向量資料庫：讀取資料 -> 切分 -> 存入 ChromaDB"""
    if not os.path.exists(DATA_PATH):
        os.makedirs(DATA_PATH)
        print(f"⚠️ 警告: {DATA_PATH} 資料夾不存在，已自動建立。請放入 .txt 檔案。")
        return None

    # 1. 讀取所有 txt 檔案
    loader = DirectoryLoader(DATA_PATH, glob="**/*.txt", loader_cls=TextLoader)
    docs = loader.load()
    
    if not docs:
        print("⚠️ 警告: data 資料夾內沒有文件，跳過建立索引。")
        return None

    print(f"📄 [{LLM_PROVIDER}] 載入 {len(docs)} 份文件，正在處理...")

    # 2. 切分文件
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)

    # 3. 建立向量資料庫
    # 注意：這裡呼叫 get_embeddings() 來決定用誰的向量
    vectorstore = Chroma.from_documents(
        documents=splits, 
        embedding_function=get_embeddings(), 
        persist_directory=DB_PATH
    )
    print(f"✅ [{LLM_PROVIDER}] 向量資料庫建立完成！路徑: {DB_PATH}")
    return vectorstore

def get_rag_chain():
    """建立 RAG 問答鏈"""
    
    # 檢查是否已經有對應模型的向量資料庫
    if not os.path.exists(DB_PATH):
        print(f"找不到 {LLM_PROVIDER} 的現有資料庫，嘗試初始化...")
        vectorstore = initialize_vector_db()
        if not vectorstore:
            return None
    else:
        # 讀取現有資料庫 (必須用同樣的 embedding model 讀取)
        vectorstore = Chroma(
            persist_directory=DB_PATH, 
            embedding_function=get_embeddings()
        )

    retriever = vectorstore.as_retriever()

    # 取得 LLM (根據全域設定)
    llm = get_llm()

    # 設定 AI 的人設 Prompt
    system_prompt = (
        "You are an AI assistant representing Rudy Chen. Your goal is to introduce Rudy to recruiters and potential collaborators."
        "Use the following pieces of retrieved context to answer the question. "
        "If the answer is not in the context, politely say you only know about Rudy's professional background. "
        "Keep the answer concise, professional, and friendly."
        "\n\n"
        "Context:\n{context}"
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("human", "{input}"),
        ]
    )

    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return rag_chain