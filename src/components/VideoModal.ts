export function renderVideoModalHtml(): string {
  return `
  <!-- MODAL: VIDEO PLAYER MODAL (PICTURE-IN-PICTURE) -->
  <div id="modal-video-player" class="hidden fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="card-3d w-full max-w-2xl p-5 shadow-2xl space-y-3 bg-white">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <i data-lucide="video" class="w-5 h-5 text-duoRed"></i>
          <h3 id="video-modal-title" class="font-black text-sm text-slate-800">Video Bài Giảng</h3>
        </div>
        <button id="btn-close-video-modal" class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
      <div id="video-modal-content" class="aspect-video w-full bg-black rounded-xl overflow-hidden flex items-center justify-center">
        <!-- Injected iframe or video element -->
      </div>
    </div>
  </div>
  `;
}

export function openVideoModal(url: string, title = 'Video Bài Giảng'): void {
  const modal = document.getElementById('modal-video-player');
  const titleEl = document.getElementById('video-modal-title');
  const content = document.getElementById('video-modal-content');

  if (!modal || !content) return;
  if (titleEl) titleEl.innerText = title;

  let embedHtml = '';
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    }
    embedHtml = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" class="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  } else {
    embedHtml = `<video src="${url}" controls autoplay class="w-full h-full object-contain"></video>`;
  }

  content.innerHTML = embedHtml;
  modal.classList.remove('hidden');
}

export function closeVideoModal(): void {
  const modal = document.getElementById('modal-video-player');
  const content = document.getElementById('video-modal-content');
  if (content) content.innerHTML = '';
  modal?.classList.add('hidden');
}

export function setupVideoModalListeners(): void {
  document.getElementById('btn-close-video-modal')?.addEventListener('click', closeVideoModal);
}
