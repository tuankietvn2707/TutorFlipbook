import { createIcons, icons } from 'lucide';

export function refreshLucideIcons(): void {
  if (typeof window !== 'undefined') {
    try {
      createIcons({ icons });
    } catch (e) {
      console.warn('Lucide icon render error:', e);
    }
  }
}
