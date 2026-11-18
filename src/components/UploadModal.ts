import { Book } from '../types';
import { extractPagesFromPdfFile } from '../services/pdfService';
import { saveBookToDB } from '../services/dbService';
import { syncBookToCloud } from '../services/firebaseService';
import { showToast, showLoader } from '../utils/toast';
import { isAudioFile } from '../utils/audioHelper';
import {
  getSelectedPdfFile,
  getUploadedAudioTracks,
  removeUploadedAudioTrack,
  resetUploadForm,
  handleSelectedPdf,
  handleBatchAudios
} from './uploadModal/uploadModalState';

export { renderUploadModalHtml } from './uploadModal/uploadModalTemplate';

export function openUploadModal(): void {
  const modal = document.getElementById('modal-upload');
  modal?.classList.remove('hidden');
  resetUploadForm();
}

export function closeUploadModal(): void {
  const modal = document.getElementById('modal-upload');
  modal?.classList.add('hidden');
}

export function setupUploadModalListeners(onBookCreated: (book: Book) => void): void {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-pdf-input') as HTMLInputElement;
  const batchAudioInput = document.getElementById('input-modal-batch-audio') as HTMLInputElement;

  dropzone?.addEventListener('click', () => fileInput?.click());

  fileInput?.addEventListener('change', (e: any) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectedPdf(e.target.files[0]);
    }
  });

  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('border-duoGreen', 'bg-duoGreen/10');
  });

  dropzone?.addEventListener('dragleave', () => {
    dropzone.classList.remove('border-duoGreen', 'bg-duoGreen/10');
  });

  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-duoGreen', 'bg-duoGreen/10');
    if (e.dataTransfer && e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      const pdf = files.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
      const audios = files.filter(f => isAudioFile(f));
      if (pdf) handleSelectedPdf(pdf);
      if (audios.length > 0) handleBatchAudios(audios);
    }
  });

  batchAudioInput?.addEventListener('change', (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      handleBatchAudios(Array.from(e.target.files));
    }
  });

  (window as any).removeUploadAudioTrack = removeUploadedAudioTrack;

  document.getElementById('btn-close-upload-modal')?.addEventListener('click', closeUploadModal);
  document.getElementById('btn-cancel-upload')?.addEventListener('click', closeUploadModal);

  document.getElementById('btn-submit-book')?.addEventListener('click', async () => {
    const selectedPdfFile = getSelectedPdfFile();
    if (!selectedPdfFile) {
      showToast('⚠️ Vui lòng chọn file PDF trước!');
      return;
    }

    const titleInput = document.getElementById('input-book-title') as HTMLInputElement;
    const colorSelect = document.getElementById('select-book-color') as HTMLSelectElement;
    const videoInput = document.getElementById('input-book-video') as HTMLInputElement;

    const title = titleInput?.value.trim() || selectedPdfFile.name.replace(/\.[^/.]+$/, '');
    const color = colorSelect?.value || 'emerald';
    const videoUrl = videoInput?.value.trim() || '';

    closeUploadModal();
    showLoader(true, 'Đang phân tích và render trang sách PDF...');

    try {
      const pages = await extractPagesFromPdfFile(selectedPdfFile);
      const newBook: Book = {
        id: 'book_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        title,
        category: 'general',
        color,
        totalPages: pages.length,
        coverImage: pages[0],
        pages,
        audioTracks: getUploadedAudioTracks(),
        videoUrl,
        createdAt: new Date().toISOString(),
        lastModified: Date.now()
      };

      await saveBookToDB(newBook);
      void syncBookToCloud(newBook, { includePages: true, includeAudio: true });
      showLoader(false);
      showToast(`🎉 Đã tải lên và render thành công ${pages.length} trang sách!`);
      onBookCreated(newBook);
    } catch (e: any) {
      showLoader(false);
      showToast(e.message || '⚠️ Lỗi render file PDF');
    }
  });
}
