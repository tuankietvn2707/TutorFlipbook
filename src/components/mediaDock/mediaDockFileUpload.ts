import { AudioTrack } from '../../types';
import { appState } from '../../state/appState';
import { naturalSortAudioTracks } from '../../utils/sorting';
import { showToast } from '../../utils/toast';
import { saveBookToDB } from '../../services/dbService';
import { syncBookToCloud } from '../../services/firebaseService';
import { isWavFormat, fileToWavBlob } from '../../services/audioService';
import {
  readFileAsAudioDataURL,
  detectAudioFormatLabel,
  isAudioFile
} from '../../utils/audioHelper';
import { initMediaDock } from './mediaDockController';

export async function handleAddAudioFilesToBook(files: FileList | null): Promise<void> {
  if (!files || files.length === 0) return;
  const curBook = appState.get('currentBook');
  if (!curBook) {
    showToast('⚠️ Vui lòng mở một cuốn sách trước khi thêm bài nghe');
    return;
  }

  const folderPrompt = prompt('Tạo thư mục/Unit cho các file audio này? (Ví dụ: Unit 1, Bài 1. Để trống nếu không cần):', '') || '';
  const baseFolder = folderPrompt.trim();

  showToast(`⏳ Đang xử lý ${files.length} tệp âm thanh (WAV/MP3)...`);

  const newTracks: AudioTrack[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!isAudioFile(file)) continue;

    const isWav = isWavFormat(file.name);
    let wavBlob: Blob | undefined;
    if (isWav) {
      try {
        wavBlob = await fileToWavBlob(file);
      } catch {
        // fallback
      }
    }

    const dataUrl = await readFileAsAudioDataURL(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    const format = detectAudioFormatLabel(file.name);

    let trackFolder = baseFolder;
    if (!trackFolder && file.webkitRelativePath) {
      const parts = file.webkitRelativePath.split('/');
      if (parts.length > 1) {
        trackFolder = parts[parts.length - 2];
      }
    }

    newTracks.push({
      id: `track-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      url: dataUrl,
      blob: wavBlob,
      folder: trackFolder || undefined,
      fileType: format
    });
  }

  if (newTracks.length === 0) {
    showToast('⚠️ Không có file âm thanh hợp lệ (.wav, .mp3, .m4a)');
    return;
  }

  const existing = curBook.audioTracks || [];
  curBook.audioTracks = naturalSortAudioTracks([...existing, ...newTracks]);
  curBook.lastModified = Date.now();

  await saveBookToDB(curBook);
  void syncBookToCloud(curBook, { includePages: false, includeAudio: true });
  appState.set('currentBook', { ...curBook });

  const allBooks = appState.get('allBooks');
  const idx = allBooks.findIndex(b => b.id === curBook.id);
  if (idx !== -1) {
    allBooks[idx] = { ...curBook };
    appState.set('allBooks', [...allBooks]);
  }

  initMediaDock(curBook);
  showToast(`🎉 Đã thêm thành công ${newTracks.length} bài nghe (.WAV/.MP3) vào sách!`);
}
