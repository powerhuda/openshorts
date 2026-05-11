import React, { useState, useEffect } from 'react';
import { Youtube, Upload, FileVideo, X, Database } from 'lucide-react';
import { getApiUrl } from '../config';

export default function MediaInput({ onProcess, isProcessing, savedSources = [] }) {
    const [youtubeUrlEnabled, setYoutubeUrlEnabled] = useState(true);
    const [mode, setMode] = useState('url'); // 'url' | 'file' | 'saved'
    const [url, setUrl] = useState('');
    const [file, setFile] = useState(null);
    const [acknowledged, setAcknowledged] = useState(false);
    const [selectedSourceIds, setSelectedSourceIds] = useState([]);

    useEffect(() => {
        fetch(getApiUrl('/api/config'))
            .then((r) => r.ok ? r.json() : null)
            .then((cfg) => {
                if (cfg && cfg.youtubeUrlEnabled === false) {
                    setYoutubeUrlEnabled(false);
                    setMode('file');
                }
            })
            .catch(() => {});
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!acknowledged) return;
        if (mode === 'url' && url) {
            const urls = url
                .split('\n')
                .map((item) => item.trim())
                .filter(Boolean);
            onProcess({ type: 'url', payload: urls[0] || '', urls, acknowledged: true });
        } else if (mode === 'file' && file) {
            onProcess({ type: 'file', payload: file, acknowledged: true });
        } else if (mode === 'saved' && selectedSourceIds.length > 0) {
            onProcess({ type: 'saved-sources', sourceIds: selectedSourceIds, acknowledged: true });
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setMode('file');
        }
    };

    return (
        <div className="bg-surface border border-white/5 rounded-2xl p-6 animate-[fadeIn_0.6s_ease-out]">
            <div className="flex gap-4 mb-6 border-b border-white/5 pb-4">
                {youtubeUrlEnabled && (
                    <button
                        type="button"
                        onClick={() => setMode('url')}
                        className={`flex items-center gap-2 pb-2 px-2 transition-all ${mode === 'url'
                            ? 'text-primary border-b-2 border-primary -mb-[17px]'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        <Youtube size={18} />
                        YouTube URL
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => setMode('file')}
                    className={`flex items-center gap-2 pb-2 px-2 transition-all ${mode === 'file'
                        ? 'text-primary border-b-2 border-primary -mb-[17px]'
                        : 'text-zinc-400 hover:text-white'
                        }`}
                >
                    <Upload size={18} />
                    Upload File
                </button>
                <button
                    type="button"
                    onClick={() => setMode('saved')}
                    className={`flex items-center gap-2 pb-2 px-2 transition-all ${mode === 'saved'
                        ? 'text-primary border-b-2 border-primary -mb-[17px]'
                        : 'text-zinc-400 hover:text-white'
                        }`}
                >
                    <Database size={18} />
                    Saved Sources
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                {mode === 'url' ? (
                    <div className="space-y-4">
                        <textarea
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder={"https://www.youtube.com/watch?v=...\nhttps://www.youtube.com/watch?v=..."}
                            className="input-field min-h-[128px]"
                            required
                        />
                        <p className="text-xs text-zinc-500">Satu URL per baris. Semua video akan didownload, digabung, lalu dianalisis sebagai satu timeline.</p>
                    </div>
                ) : mode === 'file' ? (
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${file ? 'border-primary/50 bg-primary/5' : 'border-zinc-700 hover:border-zinc-500 bg-white/5'
                            }`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        {file ? (
                            <div className="flex items-center justify-center gap-3 text-white">
                                <FileVideo className="text-primary" />
                                <span className="font-medium">{file.name}</span>
                                <button
                                    type="button"
                                    onClick={() => setFile(null)}
                                    className="p-1 hover:bg-white/10 rounded-full"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className="cursor-pointer block">
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                />
                                <Upload className="mx-auto mb-3 text-zinc-500" size={24} />
                                <p className="text-zinc-400">Click to upload or drag and drop</p>
                                <p className="text-xs text-zinc-600 mt-1">MP4, MOV up to 500MB</p>
                            </label>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="max-h-72 overflow-y-auto space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
                            {savedSources.length === 0 ? (
                                <p className="text-sm text-zinc-500">Belum ada source tersimpan. Proses URL baru dulu agar muncul di library.</p>
                            ) : (
                                savedSources.map((source) => {
                                    const checked = selectedSourceIds.includes(source.id);
                                    return (
                                        <label key={source.id} className="flex items-start gap-3 rounded-lg border border-white/5 bg-black/10 p-3 text-sm text-zinc-300 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={(e) => {
                                                    setSelectedSourceIds((prev) => e.target.checked
                                                        ? [...prev, source.id]
                                                        : prev.filter((id) => id !== source.id));
                                                }}
                                                className="mt-1 accent-primary"
                                            />
                                            <span className="flex-1">
                                                <span className="block font-medium text-white">{source.title || source.url}</span>
                                                <span className="block text-xs text-zinc-500 mt-1">{source.url}</span>
                                                <span className="block text-xs text-zinc-500 mt-1">
                                                    {Math.round(source.duration_sec || 0)}s • analyzed {source.analysis_count || 0}x
                                                </span>
                                            </span>
                                        </label>
                                    );
                                })
                            )}
                        </div>
                        <p className="text-xs text-zinc-500">Pilih beberapa source yang sudah pernah didownload untuk generate shorts baru tanpa download ulang.</p>
                    </div>
                )}

                <label className="flex items-start gap-2 mt-5 text-xs text-zinc-400 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={acknowledged}
                        onChange={(e) => setAcknowledged(e.target.checked)}
                        className="mt-0.5 accent-primary cursor-pointer"
                    />
                    <span>
                        I confirm I own this content or have the rights to process it. I am responsible for any content I submit. See our <a href="/#legal" target="_blank" rel="noopener noreferrer" className="text-primary underline" onClick={(e) => e.stopPropagation()}>Terms & Privacy</a>.
                    </span>
                </label>

                <button
                    type="submit"
                    disabled={
                        isProcessing ||
                        !acknowledged ||
                        (mode === 'url' && !url.trim()) ||
                        (mode === 'file' && !file) ||
                        (mode === 'saved' && selectedSourceIds.length === 0)
                    }
                    className="w-full btn-primary mt-4 flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing Video...
                        </>
                    ) : (
                        <>
                            Generate Clips
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
