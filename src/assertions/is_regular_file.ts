import type { AssertionDefinition } from "../assertion";
import { requireNoArgs } from "../assertion";
import { statSubject } from "./stat_subject";

export const isRegularFile: AssertionDefinition = {
  name: "is_regular_file",
  doc: [
    "The path exists and is a regular file (not a directory, symlink to a directory, FIFO, etc.).",
    "",
    "```yaml",
    "- is_regular_file",
    "```",
  ].join("\n"),
  build(args) {
    requireNoArgs("is_regular_file", args);
    return async (context) => {
      const stats = await statSubject(context.absolutePath);
      if (stats === null) {
        return { ok: false, message: "path does not exist" };
      }
      if (!stats.isFile()) {
        return { ok: false, message: "path is not a regular file" };
      }
      return { ok: true };
    };
  },
};
