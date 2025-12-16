"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// 1. 引入 Turnstile
import { Turnstile ,type TurnstileInstance} from '@marsidev/react-turnstile';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  // 2. 新增 Token 狀態
  const [token, setToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileInstance>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm Rudy's AI Assistant. Ask me anything about his skills, experience, or projects!"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    // 檢查 Token
    if (!token) {
        turnstileRef.current?.reset();
        return;
    }

    // 1. 設定使用者訊息
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    
    const currentInput = inputValue; 
    setInputValue(''); 
    setIsLoading(true);

    try {
        // 2. 發送請求 (改為相對路徑 /api/chat)
        // Nginx 會自動把它轉發到 http://localhost:8000/chat
        const res = await fetch('/api/chat', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                query: currentInput, 
                token: token 
            }) 
        });

        if (!res.ok) throw new Error("Failed to send message");
        if (!res.body) throw new Error("No response body");

        // 3. 建立一個空的 AI 訊息佔位 (讓使用者看到 AI 準備回答)
        const aiMsgId = (Date.now() + 1).toString();
        const initialAiMsg: Message = { 
            id: aiMsgId, 
            role: 'assistant', 
            content: '' 
        };
        setMessages(prev => [...prev, initialAiMsg]);

        // 4. 設定串流讀取器
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        // 5. 開始讀取串流 (Stream Loop)
        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            
            // 解碼內容 (Chunk)
            const chunkValue = decoder.decode(value, { stream: true });
            
            // 即時更新 UI：找到那則 AI 訊息，把新文字「接」在後面
            setMessages(prev => prev.map(msg => 
                msg.id === aiMsgId 
                    ? { ...msg, content: msg.content + chunkValue }
                    : msg
            ));
        }

    } catch (error) {
        console.error(error);
        const errorMsg: Message = { 
            id: Date.now().toString(), 
            role: 'assistant', 
            content: "Sorry, I'm having trouble connecting to the brain. Please try again later."
        };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsLoading(false);
        
        // 6. Token 重置 (Cloudflare Turnstile)
        setToken(""); 
        turnstileRef.current?.reset(); 
    }
  };
  
  return (
    <div className="fixed top-1/2 -translate-y-1/2 right-6 z-[60] flex flex-col items-end gap-4">
      
      {/* --- Chat Window --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[350px] h-[500px] bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-blue-600/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <h3 className="text-white font-bold text-sm">Ask Rudy's AI</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/5'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-white/5 flex gap-1">
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-slate-900/50">
              
              {/* 4. 這裡放入 Turnstile 組件 (你看不到它，因為是 invisible 模式) */}
              <div className="hidden"> 
                <Turnstile 
                  ref={turnstileRef}
                  siteKey="0x4AAAAAACGdyVmKmSjeaw9z" 
                  onSuccess={(token) => setToken(token)}
                  options={{ size: 'invisible' }}
                />
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about my skills..."
                  className="w-full bg-slate-800 text-white text-sm rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-white/5"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-400 hover:text-blue-300 disabled:opacity-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Trigger Button --- */}
      <div 
        className="relative flex items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence>
          {!isOpen && (isHovered || !isOpen) && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute right-16 bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap mr-2 pointer-events-none"
            >
              Talk with me 🤖
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/40 transition-all duration-300 ${
            isOpen 
              ? 'bg-slate-800 rotate-90' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:brightness-110'
          }`}
        >
          {isOpen ? (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          )}
        </motion.button>
      </div>
    </div>
  );
}