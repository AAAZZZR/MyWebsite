from fastapi import APIRouter
from pydantic import BaseModel
import feedparser
import requests
from typing import List
import redis
import json
import os
import threading
import schedule
import time

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
        
        for entry in feed.entries[:20]:
            real_link = resolve_url(entry.link)
            items.append({
                "title": entry.title,
                "link": real_link,
                "published": getattr(entry, 'published', "")
            })
        
        # Store in Redis with 1 hour TTL
        cache_key = self.get_cache_key(topic, region)
        r.setex(cache_key, 3600, json.dumps(items))
        return items

    def get_news(self, topic, region):
        # Try to get from Redis first
        cache_key = self.get_cache_key(topic, region)
        data = r.get(cache_key)
        
        if data:
            return json.loads(data)
        
        # If no cache, fetch immediately
        return self.fetch_and_cache(topic, region)
    
    def update_all_feeds(self):
        """Background task: update all common feed combinations"""
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


def resolve_url(url: str) -> str:
    """Resolve the actual URL from Google News redirect"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.head(url, allow_redirects=True, timeout=1, headers=headers)
        return response.url
    except Exception as e:
        print(f"Error resolving URL {url}: {e}")
        return url


# Global RSS manager instance
rss_manager = RSSManager()


@router.get("/rss", response_model=List[NewsItem])
def get_rss(topic: str = "TECHNOLOGY", region: str = "US"):
    """Get RSS news feed for given topic and region"""
    clean_topic = topic.upper() if topic.upper() in TOPICS else "TECHNOLOGY"
    clean_region = region.upper() if region.upper() in REGIONS else "US"
    
    return rss_manager.get_news(clean_topic, clean_region)


@router.post("/rss/refresh")
def force_refresh(topic: str = "TECHNOLOGY", region: str = "US"):
    """Manually refresh RSS feed cache"""
    return rss_manager.fetch_and_cache(topic, region)


def run_scheduler():
    """Background thread for RSS updates"""
    while True:
        schedule.run_pending()
        time.sleep(1)


def start_news_scheduler():
    """Start background scheduler for RSS updates"""
    schedule.every(15).minutes.do(rss_manager.update_all_feeds)
    
    # Initial fetch on startup
    try:
        print("Running initial RSS fetch...")
        rss_manager.update_all_feeds()
    except Exception as e:
        print(f"Initial fetch failed: {e}")

    # Start background thread
    thread = threading.Thread(target=run_scheduler, daemon=True)
    thread.start()
    print("📰 News scheduler started.")
