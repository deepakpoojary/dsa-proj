// Turns a free-text theory answer (paragraphs, "Heading:" lines, "- " and
// "1. " bullets) into revision-notes lines for the notes popup.

export interface NoteLine {
  text: string;
  /** 0 = top-level bullet, 1 = nested under the previous heading. */
  level: 0 | 1;
  heading?: boolean;
}

const SENTENCE_SPLIT = /(?<=[.!?])\s+(?=[A-Z(`"'])/;

function sentences(p: string): string[] {
  // Short paragraphs stay as one note; long ones become one note per sentence.
  if (p.length <= 160) return [p];
  return p.split(SENTENCE_SPLIT).map((s) => s.trim()).filter(Boolean);
}

export function answerToNotes(answer: string): NoteLine[] {
  const out: NoteLine[] = [];
  let underHeading = false;

  for (const raw of answer.split('\n')) {
    const line = raw.trim();
    if (!line) {
      underHeading = false;
      continue;
    }
    const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (bullet) {
      out.push({ text: bullet[1], level: underHeading ? 1 : 0 });
      continue;
    }
    // "Key Differences:" style lines head the bullets that follow.
    if (line.endsWith(':') && line.length <= 80) {
      out.push({ text: line.slice(0, -1), level: 0, heading: true });
      underHeading = true;
      continue;
    }
    underHeading = false;
    for (const s of sentences(line)) out.push({ text: s, level: 0 });
  }
  return out;
}

export function bulletsToNotes(bullets: string[]): NoteLine[] {
  return bullets.map((text) => ({ text, level: 0 }));
}
