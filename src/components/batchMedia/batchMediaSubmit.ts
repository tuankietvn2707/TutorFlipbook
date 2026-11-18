import { AudioTrack, Book } from '../../types';
import { appState } from '../../state/appState';
import { saveBookToDB } from '../../services/dbService';
import { syncBookToCloud } from '../../services/firebaseService';
import { naturalSortAudioTracks } from '../../utils/sorting';
import { showToast } from '../../utils/toast';
import { readFileAsAudioDataURL, detectAudioFormatLabel } from '../../utils/audioHelper';
import { isWavFormat, fileToWavBlob } from '../../services/audioService';
import { getBatchAudioQueue, clearBatchAudioQueue } from './batchMediaQueue';

export async function submitBatchAudioToBook(
  onCloseModal: () => void,
  onBatchAddedToBook: (book: Book) => void
): Promise<void> {
  const batchAudioQueue = getBatchAudioQueue();
  if (batchAudioQueue.length === 0) {
    showToast('⚠️ Vui lòng chọn ít nhất 1 file âm thanh!');
    return;
  }

  const select = document.getElementById('batch-target-book-select') as HTMLSelectElement;
  const targetBookId = select?.value;
  const books = appState.get('allBooks');
  const targetBook = books.find(b => b.id === targetBookId);

  if (!targetBook) {
    showToast('⚠️ Vui lòng chọn sách để gán file audio');
    return;
  }

  if (!targetBook.audioTracks) {
    targetBook.audioTracks = [];
  }

  showToast(`⏳ Đang lưu trữ ${batchAudioQueue.length} file audio vào sách...`);

  const newTracks: AudioTrack[] = [];
  for (let i = 0; i < batchAudioQueue.length; i++) {
    const item = batchAudioQueue[i];
    const format = detectAudioFormatLabel(item.name);
    const isWav = isWavFormat(item.name);
    let wavBlob: Blob | undefined;
    if (isWav) {
      try {
        wavBlob = await fileToWavBlob(item.file);
      } catch {
        // fallback
      }
    }

    try {
      const dataUrl = await readFileAsAudioDataURL(item.file);
      newTracks.push({
        id: 'track_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 5),
        name: item.name,
        url: dataUrl,
        blob: wavBlob,
        size: item.size,
        folder: item.folder,
        fileType: format
      });
    } catch {
      const url = URL.createObjectURL(item.file);
      newTracks.push({
        id: 'track_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 5),
        name: item.name,
        url,
        blob: wavBlob,
        size: item.size,
        folder: item.folder,
        fileType: format
      });
    }
  }

  targetBook.audioTracks = naturalSortAudioTracks([...targetBook.audioTracks, ...newTracks]);
  targetBook.lastModified = Date.now();
  await saveBookToDB(targetBook);
  void syncBookToCloud(targetBook, { includePages: false, includeAudio: true });

  clearBatchAudioQueue();
  onCloseModal();
  showToast(`🎉 Đã thêm ${newTracks.length} bài nghe Audio vào sách "${targetBook.title}"! Tổng: ${targetBook.audioTracks.length} bài`);
  onBatchAddedToBook(targetBook);
}
