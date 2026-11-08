import assert from "node:assert/strict";
import test from "node:test";

import {
  assertValidTaskInput,
  formatTaskDate,
  isValidDateOnly,
  validateTaskInput,
} from "./taskValidation.js";

test("accepts a trimmed task name and a real ISO date", () => {
  assert.deepEqual(
    validateTaskInput({ name: "  Buy milk  ", completionDate: "2026-11-08" }),
    {},
  );
  assert.deepEqual(
    assertValidTaskInput({
      name: "  Buy milk  ",
      completionDate: "2026-11-08",
    }),
    {
      name: "Buy milk",
      completionDate: "2026-11-08",
    },
  );
});

test("rejects blank names and missing or invalid dates", () => {
  assert.deepEqual(validateTaskInput({ name: "   ", completionDate: "" }), {
    name: "Enter a task name.",
    completionDate: "Choose a due date.",
  });
  assert.equal(isValidDateOnly("2026-02-30"), false);
  assert.throws(
    () => assertValidTaskInput({ name: "Task", completionDate: "2026-02-30" }),
    /valid due date/,
  );
});

test("formats date-only values without shifting them by timezone", () => {
  assert.match(formatTaskDate("2026-11-08"), /Nov|08|2026/);
});
