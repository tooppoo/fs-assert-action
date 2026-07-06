import * as path from "node:path";

export class PathResolutionError extends Error {}

/**
 * Resolves a manifest subject path against the root directory.
 *
 * Security policy (see docs/security.md):
 * - absolute subject paths are rejected
 * - paths that resolve outside the root directory are rejected
 */
export function resolveSubjectPath(root: string, subjectPath: string): string {
  if (path.posix.isAbsolute(subjectPath) || path.win32.isAbsolute(subjectPath)) {
    throw new PathResolutionError(`absolute paths are not allowed: "${subjectPath}"`);
  }

  const resolved = path.resolve(root, subjectPath);
  const relative = path.relative(root, resolved);
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new PathResolutionError(
      `path resolves outside the root directory: "${subjectPath}"`,
    );
  }

  return resolved;
}
