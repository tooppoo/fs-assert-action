import * as path from "node:path";
import { promises as fs } from "node:fs";

import type { Manifest } from "./manifest";
import type { Diagnostic } from "./diagnostic";
import { PathResolutionError, resolveSubjectPath } from "./path-resolver";

export class RootError extends Error {}

export interface RunResult {
  /** Total number of assertions executed (or rejected by path resolution). */
  checked: number;
  failures: Diagnostic[];
}

/**
 * Runs every assertion of every subject and collects all failures,
 * so a single run reports everything that is wrong at once.
 */
export async function runManifest(manifest: Manifest, rootInput: string): Promise<RunResult> {
  const root = await resolveRoot(rootInput);

  let checked = 0;
  const failures: Diagnostic[] = [];

  for (const subject of manifest.subjects) {
    let absolutePath: string;
    try {
      absolutePath = resolveSubjectPath(root, subject.path);
    } catch (error) {
      if (error instanceof PathResolutionError) {
        checked += subject.assertions.length;
        failures.push({
          path: subject.path,
          assertion: "(path resolution)",
          message: error.message,
        });
        continue;
      }
      throw error;
    }

    for (const assertion of subject.assertions) {
      checked += 1;
      const outcome = await assertion.execute({
        root,
        subjectPath: subject.path,
        absolutePath,
      });
      if (!outcome.ok) {
        failures.push({
          path: subject.path,
          assertion: assertion.name,
          message: outcome.message,
        });
      }
    }
  }

  return { checked, failures };
}

async function resolveRoot(rootInput: string): Promise<string> {
  if (rootInput.trim() === "") {
    throw new RootError('"root" must be a non-empty path');
  }
  const root = path.resolve(rootInput);
  let stats;
  try {
    stats = await fs.stat(root);
  } catch {
    throw new RootError(`root directory does not exist: "${rootInput}"`);
  }
  if (!stats.isDirectory()) {
    throw new RootError(`root is not a directory: "${rootInput}"`);
  }
  return root;
}
