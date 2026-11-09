import React, { useEffect, useRef, useState, useCallback } from 'react';

interface PdfCanvasViewerProps {
  pdfDataUrl: string;
  fileName?: string;
  title?: string;
  onDownload?: () => void;
  onReload?: () => void;
  isLoadingCloud?: boolean;
}

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

/**
 * Safely resolves a PDF source for Mozilla PDF.js.
 * Handles:
 * 1. Web/Blob/Relative URLs ({ url: ... })
 * 2. Data URIs (via browser fetch -> Uint8Array)
 * 3. Base64 strings (with sanitization, URL-safe decoding, padding, and atob error protection)
 */
async function getPdfDocumentSource(raw: string): Promise<any> {
  const trimmed = (raw || '').trim();
  if (!trimmed || trimmed === '#' || trimmed === 'null' || trimmed === 'undefined' || trimmed.length < 10) {
    return null;
  }

  // 1. Web URL, Blob URL, or relative path
  if (
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    (trimmed.startsWith('/') && !trimmed.startsWith('/9j/'))
  ) {
    return { url: trimmed };
  }

  // 2. Data URI: fetch() into ArrayBuffer is natively optimized in modern browser engines
  if (trimmed.startsWith('data:')) {
    try {
      const res = await fetch(trimmed);
      const buf = await res.arrayBuffer();
      return { data: new Uint8Array(buf) };
    } catch {
      // Fallback to manual decoding below if fetch fails
    }
  }

  // 3. Raw Base64 string
  const base64Str = trimmed.includes(',') ? trimmed.split(',')[1] : trimmed;
  let clean = base64Str.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  
  // Pad if missing '='
  const mod4 = clean.length % 4;
  if (mod4 > 0) {
    clean += '='.repeat(4 - mod4);
  }

  // Try decoding base64
  try {
    const binary = window.atob(clean);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return { data: bytes };
  } catch (err) {
    console.warn('Manual atob failed, trying fetch data-URI fallback:', err);
    try {
      const res = await fetch(`data:application/pdf;base64,${clean}`);
      const buf = await res.arrayBuffer();
      return { data: new Uint8Array(buf) };
    } catch (fetchErr) {
      console.warn('Fetch fallback failed:', fetchErr);
      return null;
    }
  }
}

export const PdfCanvasViewer: React.FC<PdfCanvasViewerProps> = ({
  pdfDataUrl,
  fileName,
  title,
  onDownload,
  onReload,
  isLoadingCloud,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const allPagesContainerRef = useRef<HTMLDivElement>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [fitMode, setFitMode] = useState<'width' | 'custom'>('width');
  const [viewMode, setViewMode] = useState<'single' | 'continuous'>('single');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [renderLoading, setRenderLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load PDF Document when pdfDataUrl changes
  useEffect(() => {
    let isCancelled = false;

    const trimmed = (pdfDataUrl || '').trim();
    if (!trimmed || trimmed === '#' || trimmed.length < 10) {
      setPdfDoc(null);
      setNumPages(0);
      setRenderLoading(false);
      return;
    }

    const loadDoc = async () => {
      setRenderLoading(true);
      setErrorMsg(null);

      // Wait briefly for pdfjsLib if CDN is still loading
      let attempts = 0;
      while (!window.pdfjsLib && attempts < 25) {
        await new Promise((res) => setTimeout(res, 100));
        attempts++;
      }

      if (!window.pdfjsLib) {
        if (!isCancelled) {
          setErrorMsg('Komponen PDF reader gagal dimuat dari jaringan. Silakan unduh dokumen langsung.');
          setRenderLoading(false);
        }
        return;
      }

      try {
        const source = await getPdfDocumentSource(trimmed);
        if (!source) {
          if (!isCancelled) {
            setPdfDoc(null);
            setNumPages(0);
            setRenderLoading(false);
          }
          return;
        }

        const loadingTask = window.pdfjsLib.getDocument({
          ...source,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setCurrentPage(1);
          setRenderLoading(false);
        }
      } catch (err: any) {
        console.error('PDF.js parse error:', err);
        if (!isCancelled) {
          setErrorMsg('Tidak dapat memproses isi file PDF ini. Silakan unduh file untuk membukanya secara langsung.');
          setRenderLoading(false);
        }
      }
    };

    loadDoc();

    return () => {
      isCancelled = true;
    };
  }, [pdfDataUrl]);

  // Render a specific page onto canvas
  const renderSinglePage = useCallback(
    async (pageNumber: number) => {
      if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

      try {
        setRenderLoading(true);
        const page = await pdfDoc.getPage(pageNumber);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate scale to fit container width smoothly on mobile and desktop
        const baseViewport = page.getViewport({ scale: 1.0 });
        const containerWidth = containerRef.current.clientWidth || 800;
        const padding = window.innerWidth < 640 ? 16 : 48;
        const availableWidth = Math.max(280, containerWidth - padding);

        let activeScale = scale;
        if (fitMode === 'width') {
          activeScale = availableWidth / baseViewport.width;
        }

        const viewport = page.getViewport({ scale: activeScale });

        // High-DPI support for retina & crystal clear mobile display
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        setRenderLoading(false);
      } catch (e: any) {
        console.warn('Canvas render page error:', e);
        setRenderLoading(false);
      }
    },
    [pdfDoc, scale, fitMode]
  );

  // Re-render single page on page / scale / mode changes
  useEffect(() => {
    if (viewMode === 'single' && pdfDoc && currentPage > 0) {
      renderSinglePage(currentPage);
    }
  }, [viewMode, pdfDoc, currentPage, scale, fitMode, renderSinglePage]);

  // Render all pages for Continuous Scroll View
  useEffect(() => {
    let isCancelled = false;

    if (viewMode !== 'continuous' || !pdfDoc || !allPagesContainerRef.current) {
      return;
    }

    const renderAll = async () => {
      setRenderLoading(true);
      const container = allPagesContainerRef.current;
      if (!container) return;
      container.innerHTML = '';

      const containerWidth = container.clientWidth || 800;
      const padding = window.innerWidth < 640 ? 12 : 32;
      const availableWidth = Math.max(280, containerWidth - padding);

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        if (isCancelled) break;
        try {
          const page = await pdfDoc.getPage(i);
          const baseViewport = page.getViewport({ scale: 1.0 });
          let activeScale = scale;
          if (fitMode === 'width') {
            activeScale = availableWidth / baseViewport.width;
          }

          const viewport = page.getViewport({ scale: activeScale });
          const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

          const pageWrapper = document.createElement('div');
          pageWrapper.className = 'relative my-4 flex flex-col items-center shadow-lg rounded-lg overflow-hidden bg-white border border-gray-200';

          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width * pixelRatio);
          canvas.height = Math.floor(viewport.height * pixelRatio);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;
          canvas.className = 'max-w-full block';

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            await page.render({ canvasContext: ctx, viewport }).promise;
          }

          const pageBadge = document.createElement('div');
          pageBadge.className = 'w-full py-1.5 px-3 bg-gray-100 text-gray-500 text-[11px] font-mono border-t border-gray-200 text-center';
          pageBadge.innerText = `Halaman ${i} dari ${pdfDoc.numPages}`;

          pageWrapper.appendChild(canvas);
          pageWrapper.appendChild(pageBadge);
          container.appendChild(pageWrapper);
        } catch (e) {
          console.warn(`Error rendering page ${i}:`, e);
        }
      }
      if (!isCancelled) {
        setRenderLoading(false);
      }
    };

    renderAll();

    return () => {
      isCancelled = true;
    };
  }, [viewMode, pdfDoc, scale, fitMode]);

  // Window resize listener to keep width responsive
  useEffect(() => {
    let timeout: any;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (fitMode === 'width' && pdfDoc) {
          if (viewMode === 'single') {
            renderSinglePage(currentPage);
          } else {
            // trigger re-render
            setScale((s) => s);
          }
        }
      }, 200);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, [fitMode, pdfDoc, viewMode, currentPage, renderSinglePage]);

  // Navigation handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage((p) => p + 1);
    }
  };

  const handleZoomIn = () => {
    setFitMode('custom');
    setScale((s) => Math.min(2.5, +(s + 0.15).toFixed(2)));
  };

  const handleZoomOut = () => {
    setFitMode('custom');
    setScale((s) => Math.max(0.4, +(s - 0.15).toFixed(2)));
  };

  const handleFitWidth = () => {
    setFitMode('width');
    setScale(1.0);
  };

  const isPendingSource = (!pdfDataUrl || pdfDataUrl.trim() === '#' || pdfDataUrl.trim().length < 10) && !errorMsg;

  return (
    <div
      ref={containerRef}
      className={`w-full bg-slate-900 rounded-2xl overflow-hidden flex flex-col border border-slate-700/80 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'shadow-xl'
      }`}
    >
      {/* Viewer Header / Toolbar */}
      <div className="bg-slate-950 px-3 sm:px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-white text-xs select-none">
        {/* Left: Title & File Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <i className="fa-solid fa-file-pdf text-[#FF9F1C] text-sm shrink-0"></i>
          <span className="font-bold text-xs truncate max-w-[140px] sm:max-w-xs md:max-w-md text-slate-100">
            {title || fileName || 'Dokumen Resep MP-ASI'}
          </span>
          {fileName && (
            <span className="hidden lg:inline-block text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono truncate max-w-[180px]">
              {fileName}
            </span>
          )}
        </div>

        {/* Center: Page Navigation (Single page mode) */}
        {numPages > 0 && viewMode === 'single' && (
          <div className="flex items-center gap-1.5 bg-slate-800/90 rounded-xl px-2 py-1 border border-slate-700">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 transition"
              title="Halaman Sebelumnya"
            >
              <i className="fa-solid fa-chevron-left text-xs"></i>
            </button>
            <div className="flex items-center gap-1 text-[11px] font-mono px-1">
              <span className="font-bold text-amber-400">{currentPage}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-300">{numPages}</span>
            </div>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className="p-1 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 transition"
              title="Halaman Selanjutnya"
            >
              <i className="fa-solid fa-chevron-right text-xs"></i>
            </button>
          </div>
        )}

        {/* Right: Controls (Zoom, Mode, Fullscreen, Download) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* View Mode Toggle: Single vs Continuous */}
          {numPages > 1 && (
            <div className="hidden sm:flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('single')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                  viewMode === 'single' ? 'bg-[#FF9F1C] text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilkan Halaman per Halaman"
              >
                1 Halaman
              </button>
              <button
                type="button"
                onClick={() => setViewMode('continuous')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                  viewMode === 'continuous' ? 'bg-[#FF9F1C] text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilkan Semua Halaman (Gulir)"
              >
                Semua Halaman
              </button>
            </div>
          )}

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800/90 rounded-lg px-1.5 py-1 border border-slate-700 gap-1">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 text-slate-400 hover:text-white transition"
              title="Perkecil (-)"
            >
              <i className="fa-solid fa-minus text-[10px]"></i>
            </button>
            <button
              type="button"
              onClick={handleFitWidth}
              className={`px-1 text-[10px] font-mono transition ${
                fitMode === 'width' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Sesuaikan Lebar Layar"
            >
              {fitMode === 'width' ? 'Auto' : `${Math.round(scale * 100)}%`}
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 text-slate-400 hover:text-white transition"
              title="Perbesar (+)"
            >
              <i className="fa-solid fa-plus text-[10px]"></i>
            </button>
          </div>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/90 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh'}
          >
            <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-xs`}></i>
          </button>

          {/* Download button */}
          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="bg-[#FF9F1C] hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold px-2.5 sm:px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 shadow transition"
              title="Unduh File PDF Dokumen"
            >
              <i className="fa-solid fa-download text-xs"></i>
              <span className="hidden sm:inline">Unduh</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas View Area */}
      <div className={`relative w-full overflow-auto bg-slate-950 flex flex-col items-center justify-start ${
        isFullscreen ? 'flex-1 p-2 sm:p-6' : 'min-h-[500px] sm:min-h-[700px] max-h-[780px] p-2 sm:p-6'
      }`}>
        {/* Loading Spinner */}
        {(renderLoading || isLoadingCloud || isPendingSource) && (
          <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white space-y-3">
            <div className="w-12 h-12 rounded-full border-3 border-amber-500/30 border-t-amber-500 animate-spin flex items-center justify-center">
              <i className="fa-solid fa-file-pdf text-[#FF9F1C] text-sm animate-pulse"></i>
            </div>
            <p className="text-xs font-semibold text-slate-200 text-center">
              {isLoadingCloud || isPendingSource
                ? 'Mengunduh potongan dokumen dari Cloud Firestore...'
                : 'Merender dokumen PDF ke layar...'}
            </p>
          </div>
        )}

        {/* Error Fallback */}
        {errorMsg && !renderLoading && (
          <div className="my-auto p-6 sm:p-8 max-w-md text-center text-white bg-slate-900 border border-red-500/30 rounded-2xl space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-2xl mx-auto">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-red-200">Gagal Menampilkan Halaman</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{errorMsg}</p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {onReload && (
                <button
                  type="button"
                  onClick={onReload}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-2 border border-slate-700 transition"
                >
                  <i className="fa-solid fa-rotate-right"></i>
                  <span>Coba Muat Ulang</span>
                </button>
              )}
              {onDownload && (
                <button
                  type="button"
                  onClick={onDownload}
                  className="bg-[#FF9F1C] hover:bg-amber-600 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-2 shadow transition"
                >
                  <i className="fa-solid fa-download"></i>
                  <span>Unduh File PDF Sekarang</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* View Mode: Single Page */}
        {viewMode === 'single' && !errorMsg && (
          <div className="flex flex-col items-center justify-center my-auto w-full max-w-full">
            <div className="shadow-2xl rounded-lg overflow-hidden border border-slate-800 bg-white inline-block max-w-full">
              <canvas ref={canvasRef} className="block max-w-full h-auto mx-auto" />
            </div>

            {/* Bottom floating page switcher on mobile */}
            {numPages > 1 && (
              <div className="mt-4 flex items-center gap-3 bg-slate-900/95 border border-slate-800 rounded-full px-4 py-1.5 shadow-lg">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300"
                >
                  <i className="fa-solid fa-arrow-left text-xs"></i>
                </button>
                <span className="text-xs font-mono text-slate-300 font-bold">
                  Halaman <span className="text-amber-400">{currentPage}</span> dari {numPages}
                </span>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage >= numPages}
                  className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300"
                >
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                </button>
              </div>
            )}
          </div>
        )}

        {/* View Mode: Continuous Scroll All Pages */}
        {viewMode === 'continuous' && !errorMsg && (
          <div ref={allPagesContainerRef} className="w-full flex flex-col items-center" />
        )}
      </div>

      {/* Footer Info Bar */}
      <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Universal HTML5 Canvas Reader (Kompatibel Desktop & Android)</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
          <span>Si Bunda Edukasi Gizi</span>
        </div>
      </div>
    </div>
  );
};
export default PdfCanvasViewer;
