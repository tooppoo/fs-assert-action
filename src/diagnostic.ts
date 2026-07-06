/**
 * A single assertion failure to be reported to the user.
 */
export interface Diagnostic {
  /** Subject path as declared in the manifest. */
  path: string;
  /** Assertion name that failed. */
  assertion: string;
  /** Human-readable reason for the failure. */
  message: string;
}

export function formatDiagnostic(diagnostic: Diagnostic): string {
  return `${diagnostic.path}: ${diagnostic.assertion}: ${diagnostic.message}`;
}
