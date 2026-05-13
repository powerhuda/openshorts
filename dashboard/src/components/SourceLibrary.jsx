import React, { useEffect, useMemo, useState } from 'react';
import { Clock3, Database, Download, Film, RefreshCw, Search, Upload, Youtube } from 'lucide-react';
import { getApiUrl } from '../config';

const formatDuration = (seconds = 0) => {
  const total = Math.max(0, Math.round(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value * 1000).toLocaleString();
};

export default function SourceLibrary({ sources = [], loading = false, onRefresh, onReuse }) {
  const [query, setQuery] = useState('');
  const [copiedSourceId, setCopiedSourceId] = useState(null);

  useEffect(() => {
    if (!copiedSourceId) return undefined;
    const timeout = setTimeout(() => setCopiedSourceId(null), 1500);
    return () => clearTimeout(timeout);
  }, [copiedSourceId]);

  const filteredSources = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return sources;
    return sources.filter((source) => {
      return [
        source.title,
        source.original_filename,
        source.url,
        source.id,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [query, sources]);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
              <Database size={12} />
              Video History
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Source Library</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
              Semua video yang pernah Anda download dari YouTube atau upload manual tersimpan di sini dan bisa dipakai ulang tanpa ingest dari nol.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block min-w-[280px]">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari judul, file, URL, atau source ID"
                className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-cyan-400/50"
              />
            </label>

            <button
              onClick={onRefresh}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10 hover:text-white"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total Sources</div>
            <div className="mt-3 text-3xl font-black text-white">{sources.length}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(34,197,94,0.12),rgba(255,255,255,0.02))] p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Uploaded Files</div>
            <div className="mt-3 text-3xl font-black text-white">{sources.filter((source) => source.source_type === 'upload').length}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(239,68,68,0.12),rgba(255,255,255,0.02))] p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">YouTube Sources</div>
            <div className="mt-3 text-3xl font-black text-white">{sources.filter((source) => source.source_type === 'youtube').length}</div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
            Memuat source library...
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-white/10 bg-black/10 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-zinc-400">
              <Film size={24} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-white">Belum ada source yang cocok</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Upload video baru atau proses URL YouTube, lalu source akan muncul otomatis di halaman ini.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredSources.map((source) => (
              <article
                key={source.id}
                className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0f1014] shadow-[0_20px_80px_rgba(0,0,0,0.25)]"
              >
                <div className="relative aspect-[9/16] bg-black">
                  {source.video_url ? (
                    <video
                      src={getApiUrl(source.video_url)}
                      className="h-full w-full object-cover"
                      controls
                      preload="metadata"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-600">No preview</div>
                  )}

                  <div className="absolute left-3 top-3 flex gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
                      source.source_type === 'upload'
                        ? 'bg-emerald-500/90 text-black'
                        : 'bg-red-500/90 text-white'
                    }`}>
                      {source.source_type === 'upload' ? 'Upload' : 'YouTube'}
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-200">
                      {source.status || 'ready'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <h2 className="line-clamp-2 text-lg font-bold leading-tight text-white">
                      {source.title || source.original_filename || source.id}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-zinc-400">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{formatDuration(source.duration_sec)}</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{source.analysis_count || 0}x analyzed</span>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-zinc-400">
                    <div className="flex items-start gap-2">
                      {source.source_type === 'upload' ? <Upload size={14} className="mt-0.5 text-emerald-400" /> : <Youtube size={14} className="mt-0.5 text-red-400" />}
                      <span className="line-clamp-2 break-all">{source.url || source.original_filename || 'Manual upload source'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock3 size={14} className="mt-0.5 text-cyan-300" />
                      <span>{formatDate(source.updated_at)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => onReuse?.(source.id)}
                      className="flex-1 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-cyan-300"
                    >
                      Reuse Source
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(source.id);
                        setCopiedSourceId(source.id);
                      }}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {copiedSourceId === source.id ? 'Copied' : 'Copy ID'}
                    </button>
                    {source.video_url && (
                      <a
                        href={getApiUrl(source.video_url)}
                        download
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-zinc-200 transition-colors hover:bg-white/10 hover:text-white"
                        title="Download source video"
                      >
                        <Download size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
