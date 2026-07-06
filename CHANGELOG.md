# Changelog

## Unreleased

### Added

- Initial implementation of `fs-assert-action` as a TypeScript JavaScript action (`runs.using: node20`, `main: dist/index.js`) ([#2](https://github.com/tooppoo/fs-assert-action/issues/2))
- Inputs: `root` (required) and `manifest` (required, inline YAML)
- Manifest `version: 1` with per-subject assertion lists
- Assertions: `exists`, `is_regular_file`, `is_executable`, `is_tarball`, `line_count` (`equals` only)
- Path containment: absolute paths and paths resolving outside `root` are rejected
- Self-test workflow invoking the action via `uses: ./`
