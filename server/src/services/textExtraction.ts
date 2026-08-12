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

const HEADING_PATTERNS = [
  // "ARTICLE IV", "Section 3", etc.
  /^(article|section)\s+[ivxlcdm\d]+/i,
  // "1. Definitions", "3.2 Limitation of Liability"
  /^\d+(\.\d+){0,3}\.?\s+\S/,
];

function isHeadingLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 120) return false;

  if (HEADING_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return true;
  }

  // ALL CAPS heading line, e.g. "INDEMNIFICATION", "LIMITATION OF LIABILITY"
  const isAllCapsShape = /^[A-Z0-9][A-Z0-9 ,&'\-/():]{2,100}$/.test(trimmed);
  const hasEnoughLetters = /[A-Z]{3,}/.test(trimmed);
  const hasNoLowercase = !/[a-z]/.test(trimmed);
  return isAllCapsShape && hasEnoughLetters && hasNoLowercase;
}

interface Section {
  heading: string | null;
  lines: string[];
}

function splitByHeadings(rawText: string): Section[] {
  const lines = rawText.replace(/\r\n/g, "\n").split("\n");
  const sections: Section[] = [];
  let current: Section = { heading: null, lines: [] };

  for (const line of lines) {
    if (isHeadingLine(line)) {
      sections.push(current);
      current = { heading: line.trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);

  return sections;
}

function splitByParagraphs(rawText: string): Section[] {
  return rawText
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n+/)
    .map((paragraph) => ({ heading: null, lines: paragraph.split("\n") }));
}

export function splitIntoClauses(rawText: string): ExtractedClause[] {
  let sections = splitByHeadings(rawText);
  const headingCount = sections.filter((section) => section.heading !== null).length;

  if (headingCount === 0) {
    sections = splitByParagraphs(rawText);
  }

  const clauses: ExtractedClause[] = [];
  for (const section of sections) {
    const text = section.lines.join("\n").trim();
    if (!text) continue;
    clauses.push({ index: clauses.length, heading: section.heading, text });
  }

  return clauses;
}
