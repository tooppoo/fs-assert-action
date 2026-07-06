import * as core from "@actions/core";

import { ManifestError, parseManifest } from "./manifest";
import { RootError, runManifest } from "./runner";
import { formatDiagnostic } from "./diagnostic";

async function main(): Promise<void> {
  const root = core.getInput("root", { required: true });
  const manifestSource = core.getInput("manifest", { required: true });

  const manifest = parseManifest(manifestSource);
  const result = await runManifest(manifest, root);

  for (const failure of result.failures) {
    core.error(formatDiagnostic(failure));
  }

  if (result.failures.length > 0) {
    core.setFailed(
      `${result.failures.length} of ${result.checked} assertion(s) failed`,
    );
    return;
  }

  core.info(
    `All assertions passed (${result.checked} assertion(s) on ${manifest.subjects.length} subject(s))`,
  );
}

main().catch((error: unknown) => {
  if (error instanceof ManifestError) {
    core.setFailed(`manifest error: ${error.message}`);
    return;
  }
  if (error instanceof RootError) {
    core.setFailed(error.message);
    return;
  }
  core.setFailed(error instanceof Error ? error.message : String(error));
});
