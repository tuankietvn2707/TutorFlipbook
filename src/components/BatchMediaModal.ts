import { Book } from '../types';
import { showToast } from '../utils/toast';
import { isAudioFile } from '../utils/audioHelper';
import {
  populateBooksDropdown,
  updateQueueListUI,
  addFilesToQueue,
  removeBatchAudioQueueItem,
  sortBatchAudioQueue,
  clearBatchAudioQueue
} from './batchMedia/batchMediaQueue';
import { submitBatchAudioToBook } from './batchMedia/batchMediaSubmit';

export { renderBatchMediaModalHtml } from './batchMedia/batchMediaTemplate';

export function openBatchMediaModal(targetBookId?: string): void {
  const modal = document.getElementById('modal-batch-media');
  modal?.classList.remove('hidden');
  populateBooksDropdown(targetBookId);
  updateQueueListUI();
}

export function closeBatchMediaModal(): void {
  const modal = document.getElementById('modal-batch-media');
  modal?.classList.add('hidden');
}

export function setupBatchMediaListeners(onBatchAddedToBook: (book: Book) => void): void {
  const dropzone = document.getElementById('batch-dropzone');
  const input = document.getElementById('batch-media-input') as HTMLInputElement;
  const folderInput = document.getElementById('batch-media-folder-input') as HTMLInputElement;

  dropzone?.addEventListener('click', (e) => {
    if (e.target === dropzone || (e.target as HTMLElement).tagName === 'P' || (e.target as HTMLElement).tagName === 'I') {
      input?.click();
    }
  });

  input?.addEventListener('change', (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(Array.from(e.target.files));
    }
  });

  folderInput?.addEventListener('change', (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      const audioFiles = Array.from(e.target.files as FileList).filter(f => isAudioFile(f));
      if (audioFiles.length > 0) addFilesToQueue(audioFiles);
    }
  });

  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('border-purple-500', 'bg-purple-100/50');
  });

  dropzone?.addEventListener('dragleave', () => {
    dropzone.classList.remove('border-purple-500', 'bg-purple-100/50');
  });

  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-purple-500', 'bg-purple-100/50');
    if (e.dataTransfer && e.dataTransfer.files) {
      const audioFiles = Array.from(e.dataTransfer.files).filter(f => isAudioFile(f));
      if (audioFiles.length > 0) addFilesToQueue(audioFiles);
    }
  });

  (window as any).removeBatchItem = removeBatchAudioQueueItem;

  document.getElementById('btn-sort-batch-asc')?.addEventListener('click', () => {
    sortBatchAudioQueue();
    showToast('✨ Đã sắp xếp danh sách audio theo số tự nhiên (1..10)');
  });

  document.getElementById('btn-clear-batch-queue')?.addEventListener('click', clearBatchAudioQueue);
  document.getElementById('btn-close-batch-modal')?.addEventListener('click', closeBatchMediaModal);
  document.getElementById('btn-cancel-batch')?.addEventListener('click', closeBatchMediaModal);

  document.getElementById('btn-submit-batch')?.addEventListener('click', () => {
    submitBatchAudioToBook(closeBatchMediaModal, onBatchAddedToBook);
  });
}
