'use client';

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type DragEvent,
  type ChangeEvent,
} from 'react';
import {
  Upload,
  X,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Package,
  Info,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { revokeObjectURL } from '@/lib/file-validation';
import {
  CONVERSION_MATRIX,
  FORMAT_REGISTRY,
  getFormatEntry,
  CATEGORY_META,
  type FormatEntry,
  type FormatCategory,
} from '@/lib/config/master-registry';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UniversalDropzoneProps {
  allowedTypes?: string[];
  mode?: 'all' | 'video' | 'audio' | 'image' | 'pdf';
}

type FileStatus = 'pending' | 'processing' | 'done' | 'error';

interface FileEntry {
  id: string;
  originalName: string;
  displayName: string;
  file: File;
  status: FileStatus;
  progress: number;
  error?: string;
  downloadUrl?: string;
  outputName?: string;
  targetFormat?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DESKTOP_LIMIT = 500 * 1024 * 1024;
const MOBILE_LIMIT  =  50 * 1024 * 1024;
const WARN_THRESHOLD = 200 * 1024 * 1024;

const MODE_ACCEPT: Record<string, string> = {
  all:   '*/*',
  video: 'video/*',
  audio: 'audio/*',
  image: 'image/*',
  pdf:   'application/pdf',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return (bytes / 1_073_741_824).toFixed(1) + ' GB';
  if (bytes >= 1_048_576)     return (bytes / 1_048_576).toFixed(1) + ' MB';
  if (bytes >= 1_024)         return (bytes / 1_024).toFixed(1) + ' KB';
  return bytes + ' B';
}

function getExtFromFile(file: File): string {
  return (file.name.split('.').pop() ?? '').toLowerCase();
}

function getTargetFormats(ext: string): FormatEntry[] {
  const targets = CONVERSION_MATRIX[ext] ?? [];
  return targets
    .map((t) => getFormatEntry(t))
    .filter((e): e is FormatEntry => e !== undefined);
}

function getCategoryForExt(ext: string): FormatCategory | null {
  const entry = getFormatEntry(ext);
  return entry ? entry.category : null;
}

function validateFile(file: File): { isValid: boolean; error?: string } {
  const mobile = isMobile();
  const limit  = mobile ? MOBILE_LIMIT : DESKTOP_LIMIT;
  if (file.size > limit) {
    const mb  = (file.size / 1_048_576).toFixed(1);
    const cap = (limit / 1_048_576).toFixed(0);
    return { isValid: false, error: `File size (${mb} MB) exceeds the ${cap} MB limit.` };
  }
  return { isValid: true };
}

function resolveDisplayName(base: string, taken: Set<string>): string {
  if (!taken.has(base)) { taken.add(base); return base; }
  let i = 1;
  while (taken.has(`${base}_${i}`)) i++;
  const name = `${base}_${i}`;
  taken.add(name);
  return name;
}

async function processFile(file: File): Promise<{ blob: Blob; outputName: string }> {
  await new Promise<void>((res) => setTimeout(res, 600 + Math.random() * 800));
  const blob = new Blob([await file.arrayBuffer()], { type: file.type || 'application/octet-stream' });
  return { blob, outputName: file.name };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ value, status }: { value: number; status: FileStatus }) {
  return (
    <div className={cn('relative h-1.5 w-full overflow-hidden rounded-full', status === 'error' ? 'bg-rose-500/20' : 'bg-slate-200/60')}>
      <div
        className={cn(
          'h-full bg-gradient-to-r transition-all duration-300 ease-out',
          status === 'done'  ? 'from-emerald-400 to-teal-500' :
          status === 'error' ? 'from-rose-400 to-red-500'     :
          'from-blue-500 to-cyan-400',
        )}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

function StatusIcon({ status }: { status: FileStatus }) {
  if (status === 'processing') return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
  if (status === 'done')       return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === 'error')      return <AlertCircle className="h-4 w-4 text-rose-500" />;
  return <div className="h-4 w-4 rounded-full border-2 border-slate-300" />;
}

// ─── Target format selector ──────────────────────────────────────────────────

function TargetFormatSelector({
  sourceExt,
  selected,
  onSelect,
}: {
  sourceExt: string;
  selected: string;
  onSelect: (ext: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const targets = getTargetFormats(sourceExt);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selectedEntry = getFormatEntry(selected);
  const category = getCategoryForExt(selected);
  const meta = category ? CATEGORY_META[category] : null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all',
          'bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-300',
        )}
      >
        {meta && (
          <span className={cn('w-2 h-2 rounded-full', meta.bgColor, 'ring-2', `ring-${meta.color.replace('text-', '')}`)} />
        )}
        <span className="text-slate-800">.{selected.toUpperCase()}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-[99] w-64 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-300/40 py-1.5 animate-in fade-in-0 zoom-in-95 duration-150">
          {targets.map((t) => {
            const cat = CATEGORY_META[t.category];
            return (
              <button
                key={t.ext}
                onClick={() => { onSelect(t.ext); setOpen(false); }}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors',
                  t.ext === selected
                    ? 'bg-cyan-50 text-cyan-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50',
                )}
              >
                <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', cat?.bgColor || 'bg-slate-100')} />
                <span className="font-mono font-semibold">.{t.ext.toUpperCase()}</span>
                <span className="text-xs text-slate-400 ml-auto truncate">{t.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function UniversalDropzone({ allowedTypes, mode = 'all' }: UniversalDropzoneProps) {
  const [isDragging, setIsDragging]         = useState(false);
  const [files, setFiles]                   = useState<FileEntry[]>([]);
  const [isRunning, setIsRunning]           = useState(false);
  const [zipUrl, setZipUrl]                 = useState<string | null>(null);
  const [largeSizeWarn, setLargeSizeWarn]   = useState(false);
  const [globalTarget, setGlobalTarget]     = useState<string>('');
  const [sourceExt, setSourceExt]           = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipUrlRef    = useRef<string | null>(null);

  const acceptAttr = allowedTypes?.join(',') ?? MODE_ACCEPT[mode] ?? '*/*';

  useEffect(() => () => { if (zipUrlRef.current) revokeObjectURL(zipUrlRef.current); }, []);

  // ── File ingestion (no routing, stay on same page) ────────────────────────

  const ingestFiles = useCallback((incoming: File[]) => {
    setFiles((prev) => {
      const remaining = Math.max(0, 20 - prev.length);
      if (remaining === 0) return prev;
      const takenNames = new Set(prev.map((f) => f.displayName));
      const newEntries: FileEntry[] = incoming.slice(0, remaining).map((file) => {
        const validation  = validateFile(file);
        const baseName    = file.name.replace(/\.[^/.]+$/, '');
        const displayName = resolveDisplayName(baseName, takenNames);
        const ext = getExtFromFile(file);

        // Detect category/target on first file
        if (prev.length === 0 && ext) {
          const targets = CONVERSION_MATRIX[ext];
          if (targets && targets.length > 0) {
            setSourceExt(ext);
            setGlobalTarget(targets[0]);
          }
        }

        const showWarn = !isMobile() && file.size > WARN_THRESHOLD && file.size <= DESKTOP_LIMIT;
        if (showWarn) setLargeSizeWarn(true);

        return {
          id: uid(),
          originalName: file.name,
          displayName,
          file,
          status: validation.isValid ? 'pending' as const : 'error' as const,
          progress: 0,
          error: validation.isValid ? undefined : validation.error,
          targetFormat: CONVERSION_MATRIX[ext]?.[0],
        };
      });
      return [...prev, ...newEntries];
    });
  }, []);

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) ingestFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  // ── Drag-and-drop ──────────────────────────────────────────────────────────

  const onDragOver  = useCallback((e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); }, []);
  const onDrop      = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) ingestFiles(dropped);
  }, [ingestFiles]);

  const handleZoneClick = () => {
    if (!hasFiles) fileInputRef.current?.click();
  };

  // ── Sequential processing ─────────────────────────────────────────────────

  const runSequential = async () => {
    const pending = files.filter((f) => f.status === 'pending');
    if (!pending.length || isRunning) return;
    setIsRunning(true);
    if (zipUrlRef.current) { revokeObjectURL(zipUrlRef.current); zipUrlRef.current = null; setZipUrl(null); }

    const results: { name: string; blob: Blob }[] = [];
    for (const entry of pending) {
      setFiles((prev) => prev.map((f) => f.id === entry.id ? { ...f, status: 'processing' as const, progress: 10 } : f));
      let downloadUrl: string | undefined;
      try {
        const interval = setInterval(() => {
          setFiles((prev) => prev.map((f) => f.id === entry.id && f.progress < 80 ? { ...f, progress: f.progress + 15 } : f));
        }, 200);
        const { blob, outputName } = await processFile(entry.file);
        clearInterval(interval);
        const targetExt = globalTarget || 'bin';
        const finalName = `${entry.displayName}.${targetExt}`;
        downloadUrl = URL.createObjectURL(blob);
        results.push({ name: finalName, blob });
        setFiles((prev) => prev.map((f) => f.id === entry.id ? { ...f, status: 'done' as const, progress: 100, downloadUrl, outputName: finalName } : f));
      } catch (err) {
        if (downloadUrl) revokeObjectURL(downloadUrl);
        const message = err instanceof Error ? err.message : 'Conversion failed';
        setFiles((prev) => prev.map((f) => f.id === entry.id ? { ...f, status: 'error' as const, progress: 0, error: message } : f));
      }
    }

    if (results.length > 1) {
      try {
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        for (const { name, blob } of results) zip.file(name, blob);
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        zipUrlRef.current = url;
        setZipUrl(url);
      } catch { /* individual downloads still work */ }
    }
    setIsRunning(false);
  };

  // ── Downloads / removal ───────────────────────────────────────────────────

  const downloadFile = (entry: FileEntry) => {
    if (!entry.downloadUrl || !entry.outputName) return;
    const a = document.createElement('a');
    a.href = entry.downloadUrl; a.download = entry.outputName;
    a.style.display = 'none'; document.body.appendChild(a); a.click();
    setTimeout(() => document.body.removeChild(a), 100);
  };

  const downloadZip = () => {
    if (!zipUrl) return;
    const a = document.createElement('a');
    a.href = zipUrl; a.download = 'converted-files.zip';
    a.style.display = 'none'; document.body.appendChild(a); a.click();
    setTimeout(() => document.body.removeChild(a), 100);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.downloadUrl) revokeObjectURL(target.downloadUrl);
      const next = prev.filter((f) => f.id !== id);
      if (next.length === 0) { setSourceExt(''); setGlobalTarget(''); setLargeSizeWarn(false); }
      return next;
    });
  };

  const reset = () => {
    files.forEach((f) => { if (f.downloadUrl) revokeObjectURL(f.downloadUrl); });
    if (zipUrlRef.current) { revokeObjectURL(zipUrlRef.current); zipUrlRef.current = null; }
    setFiles([]); setZipUrl(null); setLargeSizeWarn(false);
    setSourceExt(''); setGlobalTarget('');
  };

  // ── Derived state ─────────────────────────────────────────────────────────

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const doneCount    = files.filter((f) => f.status === 'done').length;
  const allDone      = files.length > 0 && doneCount === files.length;
  const hasFiles     = files.length > 0;

  const mobile     = typeof window !== 'undefined' ? isMobile() : false;
  const limitLabel = mobile ? '50 MB' : '500 MB';

  const sourceEntry = sourceExt ? getFormatEntry(sourceExt) : null;
  const sourceCategory = sourceEntry?.category;
  const categoryMeta = sourceCategory ? CATEGORY_META[sourceCategory] : null;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 font-sans select-none">

      {/* ── Drop zone ──────────────────────────────────────────────────────── */}
      {!hasFiles && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={handleZoneClick}
          className={cn(
            'relative cursor-pointer rounded-3xl transition-all duration-300 overflow-hidden',
            'bg-white/60 backdrop-blur-xl',
            'shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.04)]',
            isDragging
              ? 'scale-[1.015] shadow-[0_20px_60px_-8px_rgba(6,182,212,0.4),0_0_0_2px_rgba(6,182,212,0.6)] bg-cyan-50/40'
              : 'hover:shadow-[0_24px_70px_-10px_rgba(6,182,212,0.25),0_0_0_1.5px_rgba(6,182,212,0.3)] hover:scale-[1.005] hover:bg-white/70',
          )}
        >
          {/* Inner glow ring */}
          <div className={cn(
            'absolute inset-0 rounded-3xl pointer-events-none transition-all duration-300',
            isDragging
              ? 'shadow-[inset_0_0_0_2px_rgba(6,182,212,0.5)]'
              : 'shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]',
          )} />

          <div className="relative z-10 flex flex-col items-center justify-center gap-4 px-8 py-14 text-center pointer-events-none">
            {/* Upload icon orb */}
            <div className={cn(
              'relative flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300',
              isDragging
                ? 'bg-gradient-to-br from-cyan-100 to-blue-100 scale-110 shadow-lg shadow-cyan-200/50'
                : 'bg-gradient-to-br from-slate-100 to-slate-50 shadow-md shadow-slate-200/50',
            )}>
              <Upload className={cn(
                'h-7 w-7 transition-all duration-300',
                isDragging ? 'text-cyan-600 scale-110' : 'text-slate-500',
              )} />
            </div>

            <div className="space-y-1.5">
              <p className={cn(
                'text-base font-semibold transition-colors duration-200',
                isDragging ? 'text-cyan-700' : 'text-slate-800',
              )}>
                {isDragging ? 'Release to analyze & convert' : 'Drag & drop your file here'}
              </p>
              <p className="text-sm text-slate-500">
                or <span className="text-cyan-600 font-medium">click to browse</span> your files
              </p>
              <p className="text-xs text-slate-400 pt-1">
                Up to 20 files · Max {limitLabel} per file
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input — triggers immediately on click */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptAttr}
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* ── Dynamic conversion panel (appears after file selection) ────────── */}
      {hasFiles && (
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-[0_16px_48px_-12px_rgba(0,0,0,0.12)] transition-all duration-300 animate-in fade-in-0 slide-in-from-top-4">

          {/* Conversion header bar */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
            <div className="flex items-center gap-3">
              {categoryMeta && (
                <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm', categoryMeta.gradient[0], categoryMeta.gradient[1])}>
                  <categoryMeta.icon className="h-4.5 w-4.5 text-white" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {sourceExt ? `.${sourceExt.toUpperCase()}` : 'File'} conversion
                </p>
                <p className="text-xs text-slate-400">
                  {files.length} file{files.length !== 1 ? 's' : ''} ready
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {sourceExt && globalTarget && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">.{sourceExt.toUpperCase()}</span>
                  <ArrowIcon />
                  <TargetFormatSelector
                    sourceExt={sourceExt}
                    selected={globalTarget}
                    onSelect={setGlobalTarget}
                  />
                </div>
              )}
            </div>
          </div>

          {/* File list */}
          <ul className="divide-y divide-slate-100/80">
            {files.map((entry) => (
              <li key={entry.id} className="flex items-center gap-3 px-5 py-3 group hover:bg-slate-50/50 transition-colors">
                <StatusIcon status={entry.status} />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-800 truncate">{entry.originalName}</span>
                    <span className="shrink-0 text-[10px] text-slate-400">{formatBytes(entry.file.size)}</span>
                  </div>
                  {(entry.status === 'processing' || entry.status === 'done' || (entry.status === 'error' && entry.progress > 0)) && (
                    <ProgressBar value={entry.progress} status={entry.status} />
                  )}
                  {entry.status === 'error' && entry.error && (
                    <p className="text-[11px] text-rose-500 font-medium truncate">{entry.error}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {entry.status === 'done' && entry.downloadUrl && (
                    <button
                      onClick={() => downloadFile(entry)}
                      className="flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </button>
                  )}
                  {!isRunning && entry.status !== 'processing' && (
                    <button
                      onClick={() => removeFile(entry.id)}
                      className="h-6 w-6 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Remove file"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Action bar */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-2">
              {zipUrl && allDone ? (
                <button
                  onClick={downloadZip}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200/40 hover:shadow-lg hover:opacity-90 active:scale-95 transition-all"
                >
                  <Package className="h-4 w-4" />
                  Download All (.zip)
                </button>
              ) : allDone ? (
                <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  All files converted
                </span>
              ) : (
                <button
                  onClick={runSequential}
                  disabled={isRunning || pendingCount === 0}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all active:scale-95',
                    isRunning || pendingCount === 0
                      ? 'bg-slate-300 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-blue-200/40 hover:shadow-lg hover:opacity-90',
                  )}
                >
                  {isRunning ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Converting...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" />Convert to .{globalTarget.toUpperCase()}</>
                  )}
                </button>
              )}

              {!allDone && !isRunning && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-cyan-300 hover:text-cyan-700 hover:shadow-sm transition-all"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Add more
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">{doneCount}/{files.length} done</span>
              {!isRunning && (
                <button onClick={reset} className="text-xs text-slate-400 hover:text-rose-500 transition-colors font-medium">
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Large-file advisory ───────────────────────────────────────────── */}
      {largeSizeWarn && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
          <p>
            <span className="font-semibold">Large file detected.</span>{' '}
            Browser-based conversion performance depends on your device and may take longer.
          </p>
          <button onClick={() => setLargeSizeWarn(false)} className="ml-auto shrink-0 text-amber-400 hover:text-amber-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// Small arrow icon between source and target
function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-400">
      <path d="M3 8h10M10 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
