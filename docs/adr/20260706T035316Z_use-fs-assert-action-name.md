# Use fs-assert-action name

- Status: Accepted
- Created: 2026-07-06T03:53:16Z

## Context

This custom action started as a way to make release archive verification reusable. Candidate names included:

- `archive-assert-action`
- `artifact-assert-action`
- `file-assert-action`
- `path-assert-action`
- `fs-assert-action`

The name determines how broadly the action's responsibility is understood: limiting it to archives or GitHub Actions artifacts would misrepresent an action that asserts general filesystem paths.

## Decision

The repository name and action name must be `fs-assert-action`. The action display name is `FS Assert`.

The action's responsibility is structural assertion of filesystem paths: files, executables, tarballs, and (in the future) directories and similar path-local properties.

Out of scope: build, packaging, artifact upload / download, checksum verification, smoke tests, and release publishing.

## Alternatives Considered

### archive-assert-action

Matches the original release-archive use case, but limiting the target to archives makes general assertions (regular files, executables, directories) awkward to express. Not selected.

### artifact-assert-action

Natural for GitHub Actions artifacts, but strongly implies the GitHub artifact feature, which this action neither downloads nor uploads. Not selected.

### file-assert-action

Intuitive, but strictly too narrow once directories or archive entries become targets. Not selected.

### path-assert-action

Conceptually accurate but abstract; it does not communicate "filesystem assertion" to users. Not selected.

## Consequences

### Positive Consequences

- More general than `archive` or `artifact`
- Covers directories and other path types, not only files
- Consistent with keeping checksum verification out of scope
- Positions the action as a filesystem assertion action, not a GitHub-artifact operation

### Negative Consequences

- The abbreviation `fs` is more developer-oriented than `file`
- The README must state that `fs` means filesystem
- Possibly less discoverable in search than `file-assert-action`

### Neutral Consequences

- The README also states that the action does not operate on GitHub Actions artifacts (use `actions/download-artifact` / `actions/upload-artifact` separately) and that checksum verification runs in a separate step
