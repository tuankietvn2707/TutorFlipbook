/**
 * Natural Alphanumeric Sorting for Audio Tracks & Filenames
 * Ensures Track 1, Track 2 ... Track 10 sort in correct human order instead of lexicographical order.
 */
export function naturalSortAudioTracks<T extends { name: string }>(tracks: T[], order: 'asc' | 'desc' = 'asc'): T[] {
  if (!tracks || !Array.isArray(tracks)) return [];
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  const sorted = [...tracks].sort((a, b) => {
    const nameA = a.name || '';
    const nameB = b.name || '';
    return collator.compare(nameA, nameB);
  });
  return order === 'desc' ? sorted.reverse() : sorted;
}
