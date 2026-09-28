export type DiffLineType = 'add' | 'del' | 'context' | 'hunk';

export interface DiffLine {
  type: DiffLineType;
  text: string;
  oldLine?: number;
  newLine?: number;
}

const HUNK_HEADER = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@(.*)$/;

/** Parses a GitHub unified patch into lines annotated with old/new line numbers. */
export function parsePatch(patch?: string): DiffLine[] {
  if (!patch) return [];
  const lines: DiffLine[] = [];
  let oldLine = 0;
  let newLine = 0;

  for (const raw of patch.split('\n')) {
    const header = HUNK_HEADER.exec(raw);
    if (header) {
      oldLine = Number(header[1]);
      newLine = Number(header[2]);
      lines.push({ type: 'hunk', text: raw });
      continue;
    }
    if (raw.startsWith('\\')) continue;

    if (raw.startsWith('+')) {
      lines.push({ type: 'add', text: raw.slice(1), newLine: newLine++ });
    } else if (raw.startsWith('-')) {
      lines.push({ type: 'del', text: raw.slice(1), oldLine: oldLine++ });
    } else {
      lines.push({ type: 'context', text: raw.slice(1), oldLine: oldLine++, newLine: newLine++ });
    }
  }
  return lines;
}
