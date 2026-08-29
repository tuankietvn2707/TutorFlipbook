let toastTimer: number | null = null;
let isOperationCancelled = false;
let currentAbortHandler: (() => void) | null = null;

export function showToast(message: string, duration = 2600): void {
  const toast = document.getElementById('toast');
  const text = document.getElementById('toast-message');
  if (!toast || !text) return;

  text.innerText = message;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastTimer = window.setTimeout(() => {
    toast.style.transform = 'translateY(-100px)';
    toast.style.opacity = '0';
  }, duration);
}

export function showLoader(show: boolean, text = 'Đang xử lý...'): void {
  const loader = document.getElementById('flipbook-loader');
  if (!loader) return;

  if (show) {
    isOperationCancelled = false;
    loader.classList.remove('hidden');
    const status = document.getElementById('loader-status');
    const substatus = document.getElementById('loader-substatus');
    const progress = document.getElementById('loader-progress-bar');
    const percent = document.getElementById('loader-percent');

    if (status) status.innerText = text;
    if (substatus) substatus.innerText = 'Vui lòng chờ trong giây lát...';
    if (progress) progress.style.width = '0%';
    if (percent) percent.innerText = '0%';
  } else {
    loader.classList.add('hidden');
    currentAbortHandler = null;
  }
}

export function updateLoaderProgress(percent: number, statusText?: string, substatusText?: string): void {
  const progress = document.getElementById('loader-progress-bar');
  const percentLabel = document.getElementById('loader-percent');
  const status = document.getElementById('loader-status');
  const substatus = document.getElementById('loader-substatus');

  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  if (progress) progress.style.width = `${clamped}%`;
  if (percentLabel) percentLabel.innerText = `${clamped}%`;
  if (status && statusText) status.innerText = statusText;
  if (substatus && substatusText) substatus.innerText = substatusText;
}

export function cancelLoadingOperation(): void {
  isOperationCancelled = true;
  if (typeof currentAbortHandler === 'function') {
    try {
      currentAbortHandler();
    } catch (e) {}
    currentAbortHandler = null;
  }
  showLoader(false);
  showToast('⏹️ Đã dừng thao tác hiện tại!');
}

(window as any).cancelLoaderOp = cancelLoadingOperation;

export function setAbortHandler(handler: (() => void) | null): void {
  currentAbortHandler = handler;
}

export function getIsOperationCancelled(): boolean {
  return isOperationCancelled;
}
