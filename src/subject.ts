import type { AssertionSpec } from "./assertion";

/**
 * A single manifest subject: a path relative to the root directory
 * and the list of assertions to run against it.
 */
export interface Subject {
  path: string;
  assertions: AssertionSpec[];
}
