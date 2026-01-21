"use client";
import React, { useState, useEffect } from 'react';
import Tilt from 'react-parallax-tilt';

const TOPICS = [
    "TECHNOLOGY", "BUSINESS", "POLITICS", "WORLD",
    "HEALTH", "SCIENCE", "SPORTS", "ENTERTAINMENT", "NATION"
];

const REGIONS = ["US", "TW", "JP", "GB", "AU", "NZ", "CA"];

interface NewsItem {
    title: string;
    link: string;
    published: string;
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [topic, setTopic] = useState("TECHNOLOGY");
    const [region, setRegion] = useState("US");
    const [loading, setLoading] = useState(false);

    const fetchNews = async () => {
        setLoading(true);
        try {
            // For local dev: use backend directly
            // For production: nginx will proxy /api to backend
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/rss?topic=${topic}&region=${region}`);
            const data = await res.json();
            setNews(data);
        } catch (error) {
            console.error("Failed to fetch news", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, [topic, region]);

    return (
        <div className="min-h-screen w-full flex flex-col items-center bg-slate-950 px-6 py-32">
            <div className="w-full max-w-6xl">
                <h1 className="text-5xl font-extrabold text-white mb-2">Live News</h1>
                <p className="text-slate-400 mb-12 text-lg">Google Top news, powered by RSS.</p>

                <div className="flex flex-wrap gap-4 mb-12">
                    <div className="flex flex-col">
                        <label className="text-slate-400 text-sm mb-1 ml-1">Topic</label>
                        <select
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                        >
                            {TOPICS.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-slate-400 text-sm mb-1 ml-1">Region</label>
                        <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                        >
                            {REGIONS.map(r => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
                        </select>
                    </div>

                    <button
                        onClick={fetchNews}
                        className="self-end px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20"
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="text-white text-xl animate-pulse">Loading news...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {news.map((item, idx) => (
                            <Tilt
                                key={idx}
                                tiltMaxAngleX={2}
                                tiltMaxAngleY={2}
                                perspective={1000}
                                scale={1.01}
                                className="h-full"
                            >
                                <div className="h-full p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-blue-500/50 transition-colors shadow-xl flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-3 leading-snug">{item.title}</h3>
                                        <p className="text-slate-400 text-sm mb-4">{item.published}</p>
                                    </div>

                                    <div className="flex gap-4 mt-4">
                                        <a
                                            href={item.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
                                        >
                                            Read Original &rarr;
                                        </a>
                                    </div>
                                </div>
                            </Tilt>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
