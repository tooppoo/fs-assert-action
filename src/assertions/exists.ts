import type { AssertionDefinition } from "../assertion";
import { requireNoArgs } from "../assertion";
import { statSubject } from "./stat_subject";

export const exists: AssertionDefinition = {
  name: "exists",
  doc: [
    "The path exists (file, directory, or anything else reachable via `stat`).",
    "",
    "```yaml",
    "- exists",
    "```",
  ].join("\n"),
  build(args) {
    requireNoArgs("exists", args);
    return async (context) => {
      const stats = await statSubject(context.absolutePath);
      if (stats === null) {
        return { ok: false, message: "path does not exist" };
      }
      return { ok: true };
    };
  },
};
