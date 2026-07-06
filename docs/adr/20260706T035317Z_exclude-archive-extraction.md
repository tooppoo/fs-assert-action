# Exclude archive extraction and archive entry assertions

- Status: Accepted
- Created: 2026-07-06T03:53:17Z

## Context

When verifying a release archive, three concerns must be distinguished:

1. the archive file itself exists at the expected path, is a regular file, and is readable as a tarball
2. the archive is actually extracted and the extracted paths are used
3. entries inside the archive are verified directly

Extraction (2) requires the action to define extraction directories, how extracted paths are exposed, cleanup, collisions with existing files, and placement rules for multiple archives. Direct entry verification (3), e.g. a `tar_contains` assertion, requires interpreting tar metadata, entry types, permissions, and link entries. Both fall outside the core of filesystem path assertion.

Once the archive file assertions have passed, the caller can rely on the archive existing at the expected path and being readable as a tarball. The caller can then extract it and invoke `fs-assert-action` again with the extracted directory as `root`.

## Decision

`fs-assert-action` must not extract archives.

v0 must not provide assertions that verify entries inside an archive; `tar_contains` is not implemented in v0.

To verify archive contents, the caller extracts the archive and calls the action again against the extracted directory:

```yaml
- name: Assert archive file
  uses: tooppoo/fs-assert-action@v0
  with:
    root: dist
    manifest: |
      version: 1
      subjects:
        - path: app_Linux_x86_64.tar.gz
          assertions:
            - exists
            - is_regular_file
            - is_tarball

- name: Extract archive
  working-directory: dist
  run: tar -xf app_Linux_x86_64.tar.gz

- name: Assert extracted files
  uses: tooppoo/fs-assert-action@v0
  with:
    root: dist/app_Linux_x86_64
    manifest: |
      version: 1
      subjects:
        - path: app
          assertions:
            - exists
            - is_regular_file
            - is_executable
```

## Alternatives Considered

### Built-in extraction plus entry assertions

Would make archive verification single-step, but forces the action to own extraction-directory policy, cleanup, and tar entry metadata semantics. Too broad for the v0 minimum. Not selected.

### `tar_contains` without extraction

Verifying entries by reading the tar index avoids extraction, but still requires defining entry-type, permission, and link semantics. Deferred; it may later be reconsidered inside the core or as a separate action / assertion.

## Consequences

### Positive Consequences

- The action's responsibility is limited to filesystem path assertions
- No extraction-destination or cleanup policy has to be owned by the action
- Tar entry metadata semantics do not have to be defined in v0
- The extraction step is explicit in the caller's workflow
- Extracted paths are verified with the same ordinary path assertions

### Negative Consequences

- Archive verification through to extracted files cannot be completed by the action alone
- Callers must write an extraction step and a second action invocation
- Verifying archive entries without extraction is not possible in v0

### Neutral Consequences

- The `is_tarball` assertion is kept: it is a path-local check that the archive file itself is readable as a tarball, distinct from entry assertions and extraction
