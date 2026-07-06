// Generates docs/assertions.md from the co-located `doc` field of each
// src/assertions/*.ts file. Run via `npm run gen:docs`.
//
// The assertion sources are TypeScript, so they are bundled with esbuild
// into a temporary ES module and imported to obtain the rendered Markdown.
import { build } from "esbuild";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = resolve(import.meta.dirname, "..");
const bundlePath = join(tmpdir(), `fs-assert-gen-assertions-doc-${process.pid}.mjs`);

await build({
  entryPoints: [join(repoRoot, "src/docs/assertions-doc.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: bundlePath,
  logLevel: "warning",
});

const { renderAssertionsDoc } = await import(pathToFileURL(bundlePath).href);
const outputPath = join(repoRoot, "docs/assertions.md");
writeFileSync(outputPath, renderAssertionsDoc());
console.log(`Wrote ${outputPath}`);
