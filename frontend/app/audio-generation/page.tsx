"use client";
import React, { useState } from 'react';
import Tilt from 'react-parallax-tilt';

const LANGUAGES = [
    { code: 'a', name: 'American English' },
    { code: 'b', name: 'British English' },
    { code: 'j', name: 'Japanese' },
    { code: 'z', name: 'Chinese' },
];

const VOICES = [
    { id: 'af_bella', name: 'Bella (Female US)' },
    { id: 'af_sarah', name: 'Sarah (Female US)' },
    { id: 'am_adam', name: 'Adam (Male US)' },
    { id: 'am_michael', name: 'Michael (Male US)' },
    { id: 'bf_emma', name: 'Emma (Female UK)' },
    { id: 'bf_isabella', name: 'Isabella (Female UK)' },
    { id: 'bm_george', name: 'George (Male UK)' },
    { id: 'bm_lewis', name: 'Lewis (Male UK)' },
];

export default function AudioGenerationPage() {
    const [text, setText] = useState("");
    const [lang, setLang] = useState("a");
    const [voice, setVoice] = useState("af_bella");
    const [loading, setLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!text) return;
        setLoading(true);
        setAudioUrl(null);
        try {
            const res = await fetch('http://localhost:8000/generate-audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    lang_code: lang,
                    voice: voice
                })
            });

            if (!res.ok) throw new Error("Generation failed");

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
        } catch (error) {
            console.error("Error generating audio", error);
            alert("Failed to generate audio.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center bg-slate-950 px-6 py-32">
            <div className="w-full max-w-4xl">
                <h1 className="text-5xl font-extrabold text-white mb-2">Audio Generation</h1>
                <p className="text-slate-400 mb-12 text-lg">Turn your text into lifelike speech using Kokoro AI.</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls Section */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <h2 className="text-xl font-bold text-white mb-4">Settings</h2>

                            <div className="flex flex-col mb-4">
                                <label className="text-slate-400 text-sm mb-2">Language</label>
                                <select
                                    value={lang}
                                    onChange={(e) => setLang(e.target.value)}
                                    className="px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors w-full"
                                >
                                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                                </select>
                            </div>

                            <div className="flex flex-col mb-6">
                                <label className="text-slate-400 text-sm mb-2">Voice</label>
                                <select
                                    value={voice}
                                    onChange={(e) => setVoice(e.target.value)}
                                    className="px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors w-full"
                                >
                                    {VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={loading || !text}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
                            >
                                {loading ? "Generating..." : "Generate Audio"}
                            </button>
                        </div>
                    </div>

                    {/* Input & Output Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="p-1 rounded-2xl bg-gradient-to-br from-white/10 to-transparent">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Enter text to synthesize..."
                                className="w-full h-64 bg-slate-900/80 p-6 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-lg leading-relaxed"
                            />
                        </div>

                        {audioUrl && (
                            <Tilt
                                tiltMaxAngleX={2}
                                tiltMaxAngleY={2}
                                perspective={1000}
                                scale={1.02}
                            >
                                <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 flex flex-col items-center text-center">
                                    <h3 className="text-blue-300 font-bold mb-4">Generation Complete!</h3>
                                    <audio controls src={audioUrl} className="w-full mb-4" />
                                    <a
                                        href={audioUrl}
                                        download="generated_audio.wav"
                                        className="text-sm text-slate-400 hover:text-white underline transition-colors"
                                    >
                                        Download WAV
                                    </a>
                                </div>
                            </Tilt>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
