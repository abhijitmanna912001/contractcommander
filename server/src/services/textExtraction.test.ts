import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { splitIntoClauses } from "./textExtraction";

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
