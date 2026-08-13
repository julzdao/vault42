import { GardenIndex, NoteRecord, SearchCandidate, SubfolderTreeItem } from "./garden.types";


export function filterNotes(
  notes: NoteRecord[],
  q?: string | null,
  notebook?: string | null,
  subfolder?: string | null,
  subfolder3?: string | null,
): NoteRecord[] {
  const query = q?.trim().toLowerCase();
  const subfolderQuery = subfolder?.trim().toLowerCase();
  const subfolder3Query = subfolder3?.trim().toLowerCase();

  return notes.filter((note) => {
    const notebookPass = notebook ? note.notebook === notebook : true;
    if (!notebookPass) return false;

    const subfolderPass = subfolderQuery
      ? note.relativePath.toLowerCase().startsWith(`${notebook?.toLowerCase()}/${subfolderQuery}/`)
      : true;
    if (!subfolderPass) return false;

    const subfolder3Pass = subfolderQuery && subfolder3Query
      ? note.relativePath.toLowerCase().startsWith(`${notebook?.toLowerCase()}/${subfolderQuery}/${subfolder3Query}/`)
      : true;
    if (!subfolder3Pass) return false;

    if (!query) return true;

    return (
      note.title.toLowerCase().includes(query) ||
      note.rawContent.toLowerCase().includes(query) ||
      note.relativePath.toLowerCase().includes(query)
    );
  });
}

export function getNotebookSubfolderTree(notes: NoteRecord[], notebook: string): SubfolderTreeItem[] {
  const target = notebook.trim().toLowerCase();
  if (!target) return [];

  const bySecond = new Map<string, Set<string>>();

  for (const note of notes) {
    if (note.notebook.toLowerCase() !== target) continue;
    const parts = note.relativePath.split('/').filter(Boolean);
    if (parts.length < 3) continue;

    const second = parts[1];
    if (!bySecond.has(second)) bySecond.set(second, new Set());
    if (parts.length >= 4) bySecond.get(second)?.add(parts[2]);
  }

  return Array.from(bySecond.entries())
    .map(([name, children]) => ({ name, children: Array.from(children).sort((a, b) => a.localeCompare(b)) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getNotesByTag(notes: NoteRecord[], tag: string): NoteRecord[] {
  const target = tag.trim().toLowerCase();
  if (!target) return [];

  return notes
    .filter((note) => (note.tags ?? []).some((noteTag: string) => noteTag.trim().toLowerCase() === target))
    .sort((a, b) => a.title.localeCompare(b.title));
}

function stripMarkdownSyntax(input: string): string {
  return input
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getNoteContext(note: NoteRecord, maxLen = 190): string {
  const fromDescription = stripMarkdownSyntax(note.description ?? '');
  if (fromDescription) return fromDescription.length > maxLen ? `${fromDescription.slice(0, maxLen).trim()}...` : fromDescription;

  const plain = stripMarkdownSyntax(note.rawContent ?? '');
  if (!plain) return '';

  const sentenceMatch = plain.match(/.+?[.!?](?:\s|$)/);
  const sentence = sentenceMatch?.[0]?.trim() || plain;
  return sentence.length > maxLen ? `${sentence.slice(0, maxLen).trim()}...` : sentence;
}

export function formatCreatedDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

export function toSearchCandidates(index: GardenIndex): SearchCandidate[] {
  return index.notes.map((note) => ({
    slug: note.slug,
    title: note.title,
    notebook: note.notebook,
    relativePath: note.relativePath,
    tags: note.tags ?? [],
    excerpt: getNoteContext(note, 180),
  }));
}

export function buildNotePreviews(index: GardenIndex): Record<string, { coverImage: string; coverUpdatedAt?: string }> {
  return index.notes.reduce<Record<string, { coverImage: string; coverUpdatedAt?: string }>>((acc, note) => {
    if (note.coverImage) {
      acc[note.slug] = { coverImage: note.coverImage, coverUpdatedAt: note.coverUpdatedAt };
    }
    return acc;
  }, {});
}

export function scoreCandidate(candidate: SearchCandidate, query: string): number {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return 0;

  let score = 0;
  const title = candidate.title.toLowerCase();
  const path = candidate.relativePath.toLowerCase();
  const notebook = candidate.notebook.toLowerCase();
  const tags = candidate.tags.join(' ').toLowerCase();
  const excerpt = (candidate.excerpt ?? '').toLowerCase();

  if (title === normalized) score += 140;
  if (title.startsWith(normalized)) score += 90;
  if (title.includes(normalized)) score += 60;

  if (tags.includes(normalized)) score += 44;
  if (notebook.includes(normalized)) score += 34;
  if (path.includes(normalized)) score += 26;
  if (excerpt.includes(normalized)) score += 14;

  const terms = normalized.split(/\s+/).filter(Boolean);
  for (const term of terms) {
    if (title.includes(term)) score += 12;
    if (tags.includes(term)) score += 7;
    if (path.includes(term)) score += 6;
    if (notebook.includes(term)) score += 5;
    if (excerpt.includes(term)) score += 3;
  }

  return score;
}
