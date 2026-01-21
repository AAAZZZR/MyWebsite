from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import feedparser
import trafilatura
import requests
from typing import List, Optional
from fastapi.responses import FileResponse
import soundfile as sf
from kokoro import KPipeline
import random
import string
import os
import numpy as np
from datetime import datetime
import re
import redis
import json
from datetime import datetime

router = APIRouter()

r = redis.Redis(host=os.getenv('REDIS_HOST', 'redis'), port=6379, db=0, decode_responses=True)


# Constants for Topics and Regions
TOPICS = {
    "TECHNOLOGY": "TECHNOLOGY",
    "BUSINESS": "BUSINESS",
    "POLITICS": "POLITICS",
    "WORLD": "WORLD",
    "HEALTH": "HEALTH",
    "SCIENCE": "SCIENCE",
    "SPORTS": "SPORTS",
    "ENTERTAINMENT": "ENTERTAINMENT",
    "NATION": "NATION"
}

REGIONS = {
    "US": ("US", "en-US", "US:en"),
    "TW": ("TW", "zh-TW", "TW:zh-Hant"),
    "JP": ("JP", "ja-JP", "JP:ja"),
    "GB": ("GB", "en-GB", "GB:en"),
    "AU": ("AU", "en-AU", "AU:en"),
    "NZ": ("NZ", "en-NZ", "NZ:en"),
    "CA": ("CA", "en-CA", "CA:en"),
}


class RSSManager:
    @staticmethod
    def get_cache_key(topic, region):
        return f"rss:{region.upper()}:{topic.upper()}"

    def fetch_and_cache(self, topic, region):
        clean_topic = topic.upper()
        clean_region = region.upper()
        
        if clean_topic not in TOPICS: clean_topic = "TECHNOLOGY"
        if clean_region not in REGIONS: clean_region = "US"
            
        gl, hl, ceid = REGIONS[clean_region]
        topic_id = TOPICS[clean_topic]
        
        url = f"https://news.google.com/rss/headlines/section/topic/{topic_id}?hl={hl}&gl={gl}&ceid={ceid}"
        
        print(f"Fetching RSS from: {url}")
        
        feed = feedparser.parse(url)
        items = []
        
        for entry in feed.entries[:20]: # 存多一點，假設存 20 條
            real_link = resolve_url(entry.link) # 這步最慢，現在改在後台跑
            items.append({
                "title": entry.title,
                "link": real_link,
                "published": getattr(entry, 'published', "")
            })
        
        # 存入 Redis，設定過期時間 1 小時 (3600秒)
        cache_key = self.get_cache_key(topic, region)
        r.setex(cache_key, 3600, json.dumps(items))
        return items

    def get_news(self, topic, region):
        # 先從 Redis 拿
        cache_key = self.get_cache_key(topic, region)
        data = r.get(cache_key)
        
        if data:
            return json.loads(data)
        
        # 如果 Redis 沒資料 (例如剛啟動)，則即時抓取一次
        return self.fetch_and_cache(topic, region)
    
    def update_all_feeds(self):
        """背景任務專用：一次更新所有常用的組合"""
        # 你可以在這裡定義你想自動緩存的組合
        #targets = [(topic, region) for topic in TOPICS for region in REGIONS]
        targets = [
            ("TECHNOLOGY", "US"),
            ("BUSINESS", "US"),
            ("POLITICS", "US"),
            ("TECHNOLOGY", "AU"),
            ("BUSINESS", "AU"),
            ("POLITICS", "AU"),
            
        ]
        
        print("⏰ Starting background RSS update...")
        for topic, region in targets:
            try:
                self.fetch_and_cache(topic, region)
            except Exception as e:
                print(f"❌ Failed to update {region}-{topic}: {e}")
# Models
class NewsItem(BaseModel):
    title: str
    link: str
    published: str


class ExportRequest(BaseModel):
    url: str
    title: str
    topic: str
    region: str
    published: str


class AudioRequest(BaseModel):
    text: str
    lang_code: str = "a"
    voice: str = "af_bella"

# Global pipeline cache
pipelines = {}

def get_pipeline(lang_code: str):
    if lang_code not in pipelines:
        print(f"Loading pipeline for language: {lang_code}")
        pipelines[lang_code] = KPipeline(lang_code=lang_code)
    return pipelines[lang_code]

def resolve_url(url: str) -> str:
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.head(url, allow_redirects=True, timeout=1, headers=headers)
        return response.url
    except Exception as e:
        print(f"Error resolving URL {url}: {e}")
        return url

rss_manager = RSSManager()
@router.get("/rss", response_model=List[NewsItem])
def get_rss(topic: str = "TECHNOLOGY", region: str = "US"):
    # 這裡只需要做基本驗證，然後直接從 Redis 拿
    clean_topic = topic.upper() if topic.upper() in TOPICS else "TECHNOLOGY"
    clean_region = region.upper() if region.upper() in REGIONS else "US"
    
    return rss_manager.get_news(clean_topic, clean_region)

@router.post("/rss/refresh")
def force_refresh(topic: str = "TECHNOLOGY", region: str = "US"):
    # 手動刷新的接口
    return rss_manager.fetch_and_cache(topic, region)


@router.post("/generate-audio")
def generate_audio(request: AudioRequest):
    print(f"Generating audio for text length: {len(request.text)}")
    try:
        pipeline = get_pipeline(request.lang_code)
        generator = pipeline(request.text, voice=request.voice, speed=1)
        
        all_audio = []
        for i, (gs, ps, audio) in enumerate(generator):
            all_audio.append(audio)
            
        if not all_audio:
             raise HTTPException(status_code=400, detail="No audio generated")
             
        final_audio = np.concatenate(all_audio)
        
        os.makedirs("audio_output", exist_ok=True)
        filename = f"audio_{''.join(random.choices(string.ascii_lowercase + string.digits, k=8))}.wav"
        filepath = os.path.join("audio_output", filename)
        
        sf.write(filepath, final_audio, 24000)
        
        return FileResponse(filepath, media_type="audio/wav", filename="generated_audio.wav")
        
    except Exception as e:
        print(f"Error generating audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))
