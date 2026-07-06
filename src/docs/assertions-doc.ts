import { assertionDefinitions } from "../assertions";

const HEADER = [
  "<!-- Generated from src/assertions/*.ts by `npm run gen:docs`. Do not edit by hand. -->",
  "",
  "# Supported assertions",
  "",
  "Assertion names are snake_case. Assertions that test a file type or file attribute use the `is_` prefix. Assertions on quantities (such as `line_count`) do not.",
  "",
  "All assertions follow symlinks when inspecting the target.",
].join("\n");

const FOOTER = [
  "## Not supported in v0",
  "",
  "The following assertions are intentionally not implemented in v0:",
  "",
  "- `directory`",
  "- `non_empty`",
  "- `max_size`",
  "- `tar_contains`",
].join("\n");

/**
 * Renders docs/assertions.md from the co-located `doc` field of every
 * assertion definition, in declaration order.
 */
export function renderAssertionsDoc(): string {
  const sections = assertionDefinitions.map(
    (definition) => `## \`${definition.name}\`\n\n${definition.doc.trim()}`,
  );
  return [HEADER, ...sections, FOOTER].join("\n\n") + "\n";
}
