# Use TypeScript JavaScript action

- Status: Accepted
- Created: 2026-07-06T03:53:18Z

## Context

`fs-assert-action` is designed to be reused from other repositories, so constraints on the calling runner should be as small as possible.

Ruby plus a composite action was an early candidate: Ruby makes YAML parsing and dynamic dispatch easy, but it leaves a dependency on a Ruby runtime existing on the caller's runner.

GitHub Actions JavaScript actions specify a Node.js runtime in the action metadata (`runs.using: node20`, `main: dist/index.js`), so the runtime is provided by the runner itself. An action in the same repository can also be invoked from a workflow as `uses: ./`, which makes a self-test workflow straightforward.

## Decision

`fs-assert-action` must be implemented in TypeScript and run as a JavaScript action.

`action.yml` must specify:

```yaml
runs:
  using: node20
  main: dist/index.js
```

TypeScript sources live in `src/`. The compiled / bundled JavaScript is committed to the repository as `dist/index.js`.

A minimal runtime dependency for YAML parsing is allowed. `@actions/core` may be used for input handling and failure reporting. v0 keeps runtime dependencies to roughly these two.

The v0 assertion set is limited to the file assertions already proven in `reportage`:

- `exists`
- `is_regular_file`
- `is_executable`
- `is_tarball`
- `line_count`

`directory` / `non_empty` / `max_size` / `tar_contains` are not implemented in v0.

## Alternatives Considered

### Ruby + composite action

Easy YAML handling and small scripts, but requires a Ruby runtime on every calling runner. Not selected because it leaks an environment constraint to callers.

### Shell-only composite action

No runtime dependency at all, but YAML parsing and structured error reporting in shell are fragile, and cross-platform behavior is hard to keep consistent. Not selected.

## Consequences

### Positive Consequences

- No Ruby (or other language) runtime dependency on the caller
- Distributes naturally as a GitHub Actions JavaScript action
- `uses: ./` self-testing works within the same repository
- TypeScript types express the manifest / assertion model
- The v0 assertion set stays within proven usage

### Negative Consequences

- A YAML parsing dependency is required
- A compile / bundle step is required
- `dist/index.js` must be committed as a build artifact and kept in sync with `src/`

### Neutral Consequences

- Unit tests are optional in v0; the self-test workflow that invokes the action via `uses: ./` (success cases, failure cases, and each supported assertion) is mandatory
