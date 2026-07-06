import type { AssertionDefinition } from "../assertion";
import { requireNoArgs } from "../assertion";
import { statSubject } from "./stat_subject";

const ANY_EXECUTE_BIT = 0o111;

export const isExecutable: AssertionDefinition = {
  name: "is_executable",
  doc: [
    "The path exists, is a regular file, and has at least one execute permission bit set (owner, group, or other). This is a POSIX permission check; on Windows runners it is not meaningful.",
    "",
    "```yaml",
    "- is_executable",
    "```",
  ].join("\n"),
  build(args) {
    requireNoArgs("is_executable", args);
    return async (context) => {
      const stats = await statSubject(context.absolutePath);
      if (stats === null) {
        return { ok: false, message: "path does not exist" };
      }
      if (!stats.isFile()) {
        return { ok: false, message: "path is not a regular file" };
      }
      if ((stats.mode & ANY_EXECUTE_BIT) === 0) {
        return { ok: false, message: "no execute bit is set" };
      }
      return { ok: true };
    };
  },
};
