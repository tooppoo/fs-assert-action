import { promises as fs } from "node:fs";

import type { AssertionDefinition } from "../assertion";
import { AssertionArgumentError } from "../assertion";
import { statSubject } from "./stat_subject";

/**
 * Verifies that a file has exactly the expected number of lines.
 * Lines are separated by `\n`; a trailing newline does not add an
 * extra line. An empty file has 0 lines.
 *
 * v0 supports only exact match via `equals`.
 */
export const lineCount: AssertionDefinition = {
  name: "line_count",
  doc: [
    "The path exists, is a regular file, and has exactly the expected number of lines.",
    "",
    "```yaml",
    "- line_count:",
    "    equals: 2",
    "```",
    "",
    "- Lines are separated by `\\n` (a `\\r\\n` sequence counts as one line break).",
    "- A trailing newline does not add an extra line: a file containing `a\\nb\\n` has 2 lines.",
    "- An empty file has 0 lines.",
    "- v0 supports only `equals` (a non-negative integer). `greater_than` / `less_than` / ranges are not supported.",
  ].join("\n"),
  build(args) {
    const expected = parseArgs(args);
    return async (context) => {
      const stats = await statSubject(context.absolutePath);
      if (stats === null) {
        return { ok: false, message: "path does not exist" };
      }
      if (!stats.isFile()) {
        return { ok: false, message: "path is not a regular file" };
      }

      const content = await fs.readFile(context.absolutePath, "utf8");
      const actual = countLines(content);
      if (actual !== expected) {
        return {
          ok: false,
          message: `expected ${expected} line(s), found ${actual}`,
        };
      }
      return { ok: true };
    };
  },
};

function parseArgs(args: unknown): number {
  if (args === undefined) {
    throw new AssertionArgumentError('"line_count" requires arguments (e.g. "equals: 2")');
  }
  if (typeof args !== "object" || args === null || Array.isArray(args)) {
    throw new AssertionArgumentError('"line_count" arguments must be a mapping');
  }
  const keys = Object.keys(args);
  if (keys.length !== 1 || keys[0] !== "equals") {
    throw new AssertionArgumentError('"line_count" supports only the "equals" argument');
  }
  const equals = (args as Record<string, unknown>)["equals"];
  if (typeof equals !== "number" || !Number.isInteger(equals) || equals < 0) {
    throw new AssertionArgumentError('"line_count.equals" must be a non-negative integer');
  }
  return equals;
}

function countLines(content: string): number {
  if (content.length === 0) {
    return 0;
  }
  let count = 0;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === "\n") {
      count++;
    }
  }
  if (!content.endsWith("\n")) {
    count++;
  }
  return count;
}
