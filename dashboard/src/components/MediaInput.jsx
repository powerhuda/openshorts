import React, { useState, useEffect } from 'react';
import { Youtube, Upload, FileVideo, X, Database } from 'lucide-react';
import { getApiUrl } from '../config';

export default function MediaInput({
    onProcess,
    isProcessing,
    savedSources = [],
    initialSelectedSourceIds = [],
    onSelectedSourceIdsChange,
}) {
    const [youtubeUrlEnabled, setYoutubeUrlEnabled] = useState(true);
    const [mode, setMode] = useState('url'); // 'url' | 'file' | 'saved'
    const [url, setUrl] = useState('');
    const [files, setFiles] = useState([]);
    const [customPrompt, setCustomPrompt] = useState('');
    const [desiredClipCount, setDesiredClipCount] = useState('3');
    const [acknowledged, setAcknowledged] = useState(false);
    const [selectedSourceIds, setSelectedSourceIds] = useState([]);

    useEffect(() => {
        if (!initialSelectedSourceIds.length) return;
        setMode('saved');
        setSelectedSourceIds(initialSelectedSourceIds);
    }, [initialSelectedSourceIds]);

    useEffect(() => {
        onSelectedSourceIdsChange?.(selectedSourceIds);
    }, [selectedSourceIds, onSelectedSourceIdsChange]);

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
            onProcess({ type: 'url', payload: urls[0] || '', urls, customPrompt: customPrompt.trim(), desiredClipCount: Number(desiredClipCount || 3), acknowledged: true });
        } else if (mode === 'file' && files.length > 0) {
            onProcess({ type: 'file', files, customPrompt: customPrompt.trim(), desiredClipCount: Number(desiredClipCount || 3), acknowledged: true });
        } else if (mode === 'saved' && selectedSourceIds.length > 0) {
            onProcess({ type: 'saved-sources', sourceIds: selectedSourceIds, customPrompt: customPrompt.trim(), desiredClipCount: Number(desiredClipCount || 3), acknowledged: true });
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles(Array.from(e.dataTransfer.files));
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
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${files.length > 0 ? 'border-primary/50 bg-primary/5' : 'border-zinc-700 hover:border-zinc-500 bg-white/5'
                            }`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        {files.length > 0 ? (
                            <div className="space-y-3 text-left">
                                <div className="flex items-center justify-between gap-3 text-white">
                                    <div className="flex items-center gap-3">
                                        <FileVideo className="text-primary" />
                                        <span className="font-medium">{files.length} file dipilih</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFiles([])}
                                        className="p-1 hover:bg-white/10 rounded-full"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                                    {files.map((selectedFile, index) => (
                                        <div key={`${selectedFile.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200">
                                            <span className="truncate">{selectedFile.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => setFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index))}
                                                className="p-1 hover:bg-white/10 rounded-full shrink-0"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <label className="cursor-pointer block">
                                <input
                                    type="file"
                                    multiple
                                    accept="video/*"
                                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                                    className="hidden"
                                />
                                <Upload className="mx-auto mb-3 text-zinc-500" size={24} />
                                <p className="text-zinc-400">Click to upload or drag and drop</p>
                                <p className="text-xs text-zinc-600 mt-1">MP4, MOV sampai 500MB per file. Banyak file akan digabung jadi satu timeline.</p>
                            </label>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="max-h-72 overflow-y-auto space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
                            {savedSources.length === 0 ? (
                                <p className="text-sm text-zinc-500">Belum ada source tersimpan. Upload video atau proses URL YouTube dulu agar muncul di library.</p>
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
                                                <span className="block text-xs text-zinc-500 mt-1">{source.url || source.original_filename || 'Manual upload source'}</span>
                                                <span className="block text-xs text-zinc-500 mt-1">
                                                    {Math.round(source.duration_sec || 0)}s • analyzed {source.analysis_count || 0}x
                                                </span>
                                            </span>
                                        </label>
                                    );
                                })
                            )}
                        </div>
                        <p className="text-xs text-zinc-500">Pilih source YouTube atau upload lokal yang sudah pernah dipakai untuk generate shorts baru tanpa ingest ulang.</p>
                    </div>
                )}

                <div className="mt-4 space-y-2">
                    <label className="block text-sm font-medium text-zinc-200">
                        Jumlah clip
                    </label>
                    <select
                        value={desiredClipCount}
                        onChange={(e) => setDesiredClipCount(e.target.value)}
                        className="input-field"
                    >
                        <option value="3">3 clip</option>
                        <option value="5">5 clip</option>
                        <option value="7">7 clip</option>
                        <option value="10">10 clip</option>
                        <option value="15">15 clip</option>
                    </select>
                    <p className="text-xs text-zinc-500">
                        Semakin banyak clip, biasanya variasi naik tapi kualitas rata-rata bisa sedikit turun.
                    </p>
                </div>

                <div className="mt-4 space-y-2">
                    <label className="block text-sm font-medium text-zinc-200">
                        Prompt tambahan untuk AI
                    </label>
                    <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Contoh: Fokus ke momen edukatif yang paling akurat, hindari narasi bombastis, dan buat title yang sesuai isi video."
                        className="input-field min-h-[104px]"
                    />
                    <p className="text-xs text-zinc-500">
                        Prompt ini akan dipakai untuk mengarahkan pemilihan clip, hook text, dan title supaya lebih sesuai konteks video.
                    </p>
                </div>

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
                        (mode === 'file' && files.length === 0) ||
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
