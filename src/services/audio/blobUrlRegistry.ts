const activeBlobUrls = new Set<string>();

export function registerBlobUrl(blob: Blob): string {
  const url = URL.createObjectURL(blob);
  activeBlobUrls.add(url);
  return url;
}

export function revokeTrackedBlobUrl(url: string | null | undefined): void {
  if (!url) return;
  if (activeBlobUrls.has(url)) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
    activeBlobUrls.delete(url);
  }
}

export function revokeAllBlobUrls(): void {
  for (const url of activeBlobUrls) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }
  activeBlobUrls.clear();
}
