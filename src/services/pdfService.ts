import * as pdfjsDist from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { getIsOperationCancelled, updateLoaderProgress } from '../utils/toast';

// Setup pdfjs worker reliably with Vite bundled worker URL
const pdfjs = (window as any).pdfjsLib || pdfjsDist;

if (typeof window !== 'undefined' && pdfjs && pdfjs.GlobalWorkerOptions) {
  try {
    if (pdfjsWorker) {
      pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    } else {
      const version = pdfjs.version || '6.2.108';
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
    }
  } catch (e) {
    console.warn('pdfjs worker configuration:', e);
    const version = pdfjs.version || '6.2.108';
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
  }
}

export async function extractPagesFromPdfFile(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const activePdfLib = (window as any).pdfjsLib || pdfjs;

  if (!activePdfLib || !activePdfLib.getDocument) {
    throw new Error('Thư viện PDF.js chưa sẵn sàng!');
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = activePdfLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const pageImages: string[] = [];
  const canvas = document.createElement('canvas');
  // Use hardware-accelerated 2D context for faster GPU rasterization
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Không thể khởi tạo Canvas 2D');
  }

  try {
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      if (getIsOperationCancelled()) {
        throw new Error('Thao tác render PDF đã bị hủy!');
      }

      const page = await pdfDoc.getPage(pageNum);
      // Adaptive scale: ensure sharp text while keeping VRAM & CPU memory optimal
      const baseViewport = page.getViewport({ scale: 1.0 });
      let targetScale = 1.35;
      if (baseViewport.width > 950 || baseViewport.height > 1300) {
        targetScale = 1.15;
      }
      const viewport = page.getViewport({ scale: targetScale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: ctx,
        viewport: viewport
      }).promise;

      // 0.82 quality gives crisp text while cutting base64 texture memory by ~30%
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      pageImages.push(dataUrl);
      
      // CRITICAL: Release PDF.js page memory immediately to prevent gigabytes of RAM usage
      try {
        page.cleanup();
      } catch (e) {
        // ignore
      }

      const percent = Math.round((pageNum / numPages) * 100);
      if (onProgress) {
        onProgress(pageNum, numPages);
      }
      updateLoaderProgress(
        percent,
        `Đang render trang ${pageNum} / ${numPages}`,
        `Đã hoàn thành ${percent}% tài liệu`
      );

      // Give the main thread a breathing window to process UI updates and garbage collection, preventing CPU thermal spikes
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  } finally {
    // Release canvas memory buffer immediately
    canvas.width = 0;
    canvas.height = 0;
    
    // CRITICAL: Destroy PDF document to clear huge worker and main-thread memory cache
    try {
      if (pdfDoc) {
        await pdfDoc.destroy();
      }
    } catch (e) {
      console.warn('Error destroying pdfDoc', e);
    }
  }

  return pageImages;
}
