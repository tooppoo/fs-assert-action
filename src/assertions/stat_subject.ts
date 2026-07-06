import { promises as fs, type Stats } from "node:fs";

/**
 * Stats a subject path, following symlinks.
 * Returns null when the path does not exist.
 */
export async function statSubject(absolutePath: string): Promise<Stats | null> {
  try {
    return await fs.stat(absolutePath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || code === "ENOTDIR") {
      return null;
    }
    throw error;
  }
}
