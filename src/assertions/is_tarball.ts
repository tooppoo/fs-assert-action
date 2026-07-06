import { execFile } from "node:child_process";
import { promisify } from "node:util";

import type { AssertionDefinition } from "../assertion";
import { requireNoArgs } from "../assertion";
import { statSubject } from "./stat_subject";

const execFileAsync = promisify(execFile);

/**
 * Checks that the file can be listed as a tar archive by `tar -tf`,
 * which auto-detects gzip and other supported compression. The archive
 * is neither extracted nor inspected entry-by-entry.
 */
export const isTarball: AssertionDefinition = {
  name: "is_tarball",
  doc: [
    "The path exists, is a regular file, and can be listed as a tar archive by `tar -tf` (which auto-detects gzip and other supported compression). The assertion passes when `tar` exits with status 0.",
    "",
    "This assertion does not extract the archive and does not verify entries inside it. To verify archive contents, extract the archive in your workflow and run the action again with the extracted directory as `root` (see the [README](../README.md#archives-are-not-extracted)).",
    "",
    "```yaml",
    "- is_tarball",
    "```",
  ].join("\n"),
  build(args) {
    requireNoArgs("is_tarball", args);
    return async (context) => {
      const stats = await statSubject(context.absolutePath);
      if (stats === null) {
        return { ok: false, message: "path does not exist" };
      }
      if (!stats.isFile()) {
        return { ok: false, message: "path is not a regular file" };
      }
      try {
        await execFileAsync("tar", ["-tf", context.absolutePath]);
        return { ok: true };
      } catch {
        return { ok: false, message: "file is not readable as a tarball" };
      }
    };
  },
};
