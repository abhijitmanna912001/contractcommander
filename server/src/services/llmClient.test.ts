import assert from "node:assert/strict";
import { test } from "node:test";
import { APIError } from "@anthropic-ai/sdk";
import { withOverloadRetry } from "./llmClient";

function apiError(status: number, message: string): APIError {
  return new APIError(status, { message }, message, undefined);
}

test("withOverloadRetry retries a 429 and succeeds once the call recovers", async () => {
  let calls = 0;
  const result = await withOverloadRetry(async () => {
    calls += 1;
    if (calls < 2) throw apiError(429, "rate limited");
    return "ok";
  });

  assert.equal(result, "ok");
  assert.equal(calls, 2, "expected exactly one retry after the first 429");
});

test("withOverloadRetry retries a 529 and succeeds once the call recovers", async () => {
  let calls = 0;
  const result = await withOverloadRetry(async () => {
    calls += 1;
    if (calls < 3) throw apiError(529, "overloaded");
    return "ok";
  });

  assert.equal(result, "ok");
  assert.equal(calls, 3, "expected two retries after two 529s");
});

test("withOverloadRetry retries a 529 three times and succeeds on the last attempt", async () => {
  let calls = 0;
  const result = await withOverloadRetry(async () => {
    calls += 1;
    if (calls < 4) throw apiError(529, "overloaded");
    return "ok";
  });

  assert.equal(result, "ok");
  assert.equal(calls, 4, "expected the initial attempt plus all 3 retries to succeed");
});

test("withOverloadRetry gives up after 3 retries and throws the last error", async () => {
  let calls = 0;
  await assert.rejects(
    withOverloadRetry(async () => {
      calls += 1;
      throw apiError(429, "still rate limited");
    }),
    (err: unknown) => err instanceof APIError && err.status === 429
  );

  assert.equal(calls, 4, "expected the initial attempt plus 3 retries, then give up");
});

test("withOverloadRetry does not retry a 400 bad request", async () => {
  let calls = 0;
  await assert.rejects(
    withOverloadRetry(async () => {
      calls += 1;
      throw apiError(400, "bad request");
    }),
    (err: unknown) => err instanceof APIError && err.status === 400
  );

  assert.equal(calls, 1, "expected no retries for a 400");
});

test("withOverloadRetry does not retry a 401 authentication error", async () => {
  let calls = 0;
  await assert.rejects(
    withOverloadRetry(async () => {
      calls += 1;
      throw apiError(401, "invalid api key");
    }),
    (err: unknown) => err instanceof APIError && err.status === 401
  );

  assert.equal(calls, 1, "expected no retries for a 401");
});

test("withOverloadRetry does not retry a non-APIError", async () => {
  let calls = 0;
  await assert.rejects(
    withOverloadRetry(async () => {
      calls += 1;
      throw new Error("unrelated failure");
    }),
    /unrelated failure/
  );

  assert.equal(calls, 1, "expected no retries for an error that isn't an APIError");
});
