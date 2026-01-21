import redis
import json
import feedparser
import os
from datetime import datetime

# 連接設定（配合 Docker Compose 的服務名稱）
r = redis.Redis(host=os.getenv('REDIS_HOST', 'redis'), port=6379, db=0, decode_responses=True)

class RSSManager:
    @staticmethod
    def get_cache_key(topic, region):
        return f"rss:{region.upper()}:{topic.upper()}"

    def fetch_and_cache(self, topic, region):
        # 這裡放入你原本的 URL 拼接邏輯
        # ... gl, hl, ceid = REGIONS[region] ...
        # ... url = f"..." ...
        
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