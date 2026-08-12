import pdfParse from "pdf-parse";

export interface ExtractedClause {
  index: number;
  heading: string | null;
  text: string;
}

export async function extractText(
  buffer: Buffer,
  mimeType: string | undefined,
  filename: string
): Promise<string> {
  const isPdf = mimeType === "application/pdf" || filename.toLowerCase().endsWith(".pdf");

  if (isPdf) {
    const { text } = await pdfParse(buffer);
    return text;
  }

  return buffer.toString("utf-8");
}

interface Section {
  heading: string | null;
  text: string;
}

// A numbered heading at the start of a line, e.g. "5. Liability." or "12. Warranty. ...".
// Body text commonly follows on the same line/paragraph as the heading, not a separate one.
const NUMBERED_HEADING_LINE_RE = /^\d{1,3}\.\s+\S/gm;

// The short title portion of a matched heading line, e.g. "5. Liability." out of
// "5. Liability. Provider's total liability shall not exceed...".
const NUMBERED_HEADING_LABEL_RE = /^\d{1,3}\.\s+[^.\n]{1,79}\./;

function findNumberedHeadingStarts(text: string): number[] {
  const starts: number[] = [];
  for (const match of text.matchAll(NUMBERED_HEADING_LINE_RE)) {
    if (match.index !== undefined) starts.push(match.index);
  }
  return starts;
}

function extractHeadingLabel(segment: string): string {
  const match = segment.match(NUMBERED_HEADING_LABEL_RE);
  if (match) return match[0].trim();

  const firstLine = segment.split("\n", 1)[0]?.trim() ?? "";
  return firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine;
}

function splitAtNumberedHeadings(text: string, headingStarts: number[]): Section[] {
  const sections: Section[] = [];

  const preamble = text.slice(0, headingStarts[0]).trim();
  if (preamble) {
    sections.push({ heading: null, text: preamble });
  }

  for (let i = 0; i < headingStarts.length; i++) {
    const start = headingStarts[i];
    const end = i + 1 < headingStarts.length ? headingStarts[i + 1] : text.length;
    const segmentText = text.slice(start, end).trim();
    if (!segmentText) continue;
    sections.push({ heading: extractHeadingLabel(segmentText), text: segmentText });
  }

  return sections;
}

function splitByParagraphs(text: string): Section[] {
  return text
    .split(/\n\s*\n+/)
    .map((paragraph) => ({ heading: null, text: paragraph.trim() }))
    .filter((section) => section.text.length > 0);
}

export function splitIntoClauses(rawText: string): ExtractedClause[] {
  const normalized = rawText.replace(/\r\n/g, "\n");
  const headingStarts = findNumberedHeadingStarts(normalized);

  // Numbered headings ("1. Definitions.", "2. License Grant.", ...) are the primary
  // signal. Only fall back to paragraph-break splitting when none are found at all.
  const sections =
    headingStarts.length > 0
      ? splitAtNumberedHeadings(normalized, headingStarts)
      : splitByParagraphs(normalized);

  const clauses: ExtractedClause[] = [];
  for (const section of sections) {
    if (!section.text) continue;
    clauses.push({ index: clauses.length, heading: section.heading, text: section.text });
  }

  return clauses;
}
