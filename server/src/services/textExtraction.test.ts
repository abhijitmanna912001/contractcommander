import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { extractText, sanitizeExtractedText, splitIntoClauses } from "./textExtraction";

const SAMPLE_CONTRACTS_DIR = join(__dirname, "../../../sample-contracts");

function loadSample(filename: string): string {
  return readFileSync(join(SAMPLE_CONTRACTS_DIR, filename), "utf-8");
}

function countNumberedClauses(clauses: ReturnType<typeof splitIntoClauses>): number {
  return clauses.filter((clause) => clause.heading && /^\d+\./.test(clause.heading)).length;
}

test("splits a long contract with 18 numbered sections into ~18 clauses, not 1-2", () => {
  const clauses = splitIntoClauses(loadSample("04-long-enterprise-agreement.txt"));

  assert.equal(countNumberedClauses(clauses), 18, `expected 18 numbered clauses, got ${countNumberedClauses(clauses)}`);
  assert.ok(clauses.length >= 15, `expected clauseCount close to 18, got ${clauses.length}`);
});

test("still splits the shorter sample contracts (10 numbered sections each) correctly", () => {
  for (const filename of [
    "01-high-risk-service-agreement.txt",
    "02-low-risk-mutual-nda.txt",
    "03-medium-risk-freelance-agreement.txt",
  ]) {
    const clauses = splitIntoClauses(loadSample(filename));
    const numbered = countNumberedClauses(clauses);
    assert.equal(numbered, 10, `${filename}: expected 10 numbered clauses, got ${numbered}`);
  }
});

test("extracts a short heading label alongside the full clause text", () => {
  const clauses = splitIntoClauses(loadSample("04-long-enterprise-agreement.txt"));
  const liability = clauses.find((clause) => clause.heading === "5. Liability.");

  assert.ok(liability, "expected to find a clause headed '5. Liability.'");
  assert.match(liability!.text, /Provider's total liability under this Agreement/);
});

test("falls back to paragraph splitting when no numbered headings are present", () => {
  const text = "Intro paragraph with no numbering.\n\nSecond paragraph, still no numbers.\n\nThird paragraph.";
  const clauses = splitIntoClauses(text);

  assert.equal(clauses.length, 3);
  assert.ok(clauses.every((clause) => clause.heading === null));
});

// Regression test for a real bug: some PDFs (particularly ones with tables
// or complex formatting) make pdf-parse emit NUL and other control-character
// artifacts, which Postgres text columns reject outright with "invalid byte
// sequence for encoding UTF8: 0x00". Control characters are built via
// String.fromCharCode rather than typed as escape sequences so this file
// never has to contain a literal embedded control byte.
test("sanitizeExtractedText strips NUL and other control characters but keeps whitespace", () => {
  const NUL = String.fromCharCode(0);
  const BACKSPACE = String.fromCharCode(8);
  const VERTICAL_TAB = String.fromCharCode(11);
  const FORM_FEED = String.fromCharCode(12);
  const ESCAPE = String.fromCharCode(27);
  const DEL = String.fromCharCode(127);

  const dirty =
    "Liability" +
    NUL +
    " clause" +
    BACKSPACE +
    VERTICAL_TAB +
    FORM_FEED +
    ESCAPE +
    DEL +
    " text\tindented\nnext line\r\n";

  const clean = sanitizeExtractedText(dirty);

  assert.ok(!clean.includes(NUL), "expected the NUL byte to be stripped");
  for (const controlChar of [BACKSPACE, VERTICAL_TAB, FORM_FEED, ESCAPE, DEL]) {
    assert.ok(!clean.includes(controlChar), "expected other control characters to be stripped");
  }
  assert.equal(clean, "Liability clause text\tindented\nnext line\r\n");
});

test("extractText sanitizes NUL bytes out of an upload (the Postgres UTF8 crash trigger)", async () => {
  const NUL = String.fromCharCode(0);
  const dirtyBuffer = Buffer.from(
    `1. Liability.${NUL} Clause text extracted with an embedded null byte, as pdf-parse can produce.`,
    "utf-8"
  );

  const text = await extractText(dirtyBuffer, "text/plain", "contract.txt");

  assert.ok(!text.includes(NUL), "expected extractText to strip NUL bytes before they reach Postgres");

  // The sanitized text should still split into a clause normally.
  const clauses = splitIntoClauses(text);
  assert.ok(clauses.some((clause) => clause.heading === "1. Liability."));
  assert.ok(clauses.every((clause) => !clause.text.includes(NUL) && !(clause.heading ?? "").includes(NUL)));
});
