import type { AssertionDefinition } from "../assertion";
import { exists } from "./exists";
import { isRegularFile } from "./is_regular_file";
import { isExecutable } from "./is_executable";
import { isTarball } from "./is_tarball";
import { lineCount } from "./line_count";

/**
 * The v0 allowlist, in documentation order. Assertion names not listed
 * here are rejected as manifest errors. Names are snake_case; file type
 * / attribute predicates use the `is_` prefix.
 */
export const assertionDefinitions: readonly AssertionDefinition[] = [
  exists,
  isRegularFile,
  isExecutable,
  isTarball,
  lineCount,
];

export const assertionRegistry: Record<string, AssertionDefinition> = Object.fromEntries(
  assertionDefinitions.map((definition) => [definition.name, definition]),
);
