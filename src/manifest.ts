import { parse as parseYaml } from "yaml";

import { AssertionArgumentError } from "./assertion";
import type { AssertionSpec } from "./assertion";
import { assertionRegistry } from "./assertions";
import type { Subject } from "./subject";

export const SUPPORTED_VERSION = 1;

export class ManifestError extends Error {}

export interface Manifest {
  version: typeof SUPPORTED_VERSION;
  subjects: Subject[];
}

/**
 * Parses and validates an inline YAML manifest.
 *
 * Only the structure described in docs/manifest.md is accepted:
 * a mapping with an integer `version: 1` and a `subjects` array of
 * `{ path, assertions }` mappings. Assertion names are dispatched
 * against the v0 allowlist; unknown names are manifest errors.
 */
export function parseManifest(source: string): Manifest {
  if (source.trim() === "") {
    throw new ManifestError("manifest is empty");
  }

  let document: unknown;
  try {
    document = parseYaml(source);
  } catch (error) {
    throw new ManifestError(`invalid YAML: ${(error as Error).message}`);
  }

  if (!isPlainObject(document)) {
    throw new ManifestError("manifest root must be a mapping");
  }

  const unknownKeys = Object.keys(document).filter(
    (key) => key !== "version" && key !== "subjects",
  );
  if (unknownKeys.length > 0) {
    throw new ManifestError(`unknown manifest key(s): ${unknownKeys.join(", ")}`);
  }

  const version = document["version"];
  if (version !== SUPPORTED_VERSION) {
    throw new ManifestError(
      `unsupported manifest version: ${JSON.stringify(version)} (expected ${SUPPORTED_VERSION})`,
    );
  }

  const subjects = document["subjects"];
  if (!Array.isArray(subjects)) {
    throw new ManifestError('"subjects" must be an array');
  }

  return {
    version: SUPPORTED_VERSION,
    subjects: subjects.map((raw, index) => parseSubject(raw, index)),
  };
}

function parseSubject(raw: unknown, index: number): Subject {
  const label = `subjects[${index}]`;
  if (!isPlainObject(raw)) {
    throw new ManifestError(`${label} must be a mapping`);
  }

  const unknownKeys = Object.keys(raw).filter(
    (key) => key !== "path" && key !== "assertions",
  );
  if (unknownKeys.length > 0) {
    throw new ManifestError(`${label} has unknown key(s): ${unknownKeys.join(", ")}`);
  }

  const path = raw["path"];
  if (typeof path !== "string" || path === "") {
    throw new ManifestError(`${label}.path must be a non-empty string`);
  }

  const rawAssertions = raw["assertions"];
  if (!Array.isArray(rawAssertions) || rawAssertions.length === 0) {
    throw new ManifestError(`${label}.assertions must be a non-empty array`);
  }

  return {
    path,
    assertions: rawAssertions.map((entry, assertionIndex) =>
      parseAssertion(entry, `${label}.assertions[${assertionIndex}]`),
    ),
  };
}

function parseAssertion(entry: unknown, label: string): AssertionSpec {
  let name: string;
  let args: unknown;

  if (typeof entry === "string") {
    name = entry;
    args = undefined;
  } else if (isPlainObject(entry)) {
    const keys = Object.keys(entry);
    if (keys.length !== 1) {
      throw new ManifestError(`${label} must be a string or a single-key mapping`);
    }
    name = keys[0] as string;
    args = entry[name];
  } else {
    throw new ManifestError(`${label} must be a string or a single-key mapping`);
  }

  const definition = assertionRegistry[name];
  if (definition === undefined) {
    throw new ManifestError(`${label}: unknown assertion "${name}"`);
  }

  try {
    return { name: definition.name, execute: definition.build(args) };
  } catch (error) {
    if (error instanceof AssertionArgumentError) {
      throw new ManifestError(`${label}: ${error.message}`);
    }
    throw error;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
