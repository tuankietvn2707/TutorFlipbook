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
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Không thể khởi tạo Canvas 2D');
  }

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (getIsOperationCancelled()) {
      throw new Error('Thao tác render PDF đã bị hủy!');
    }

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: ctx,
      viewport: viewport
    }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    pageImages.push(dataUrl);

    const percent = Math.round((pageNum / numPages) * 100);
    if (onProgress) {
      onProgress(pageNum, numPages);
    }
    updateLoaderProgress(
      percent,
      `Đang render trang ${pageNum} / ${numPages}`,
      `Đã hoàn thành ${percent}% tài liệu`
    );
  }

  return pageImages;
}
