# Exclude checksum verification

- Status: Accepted
- Created: 2026-07-06T03:53:15Z

## Context

The starting point of `fs-assert-action` is release archive verification. Verifying release artifacts typically involves:

- the archive file exists
- the archive file is a regular file
- the archive file is readable as a tarball
- a checksum file exists
- the archive digests are verified against the checksum file

Checksum verification differs in nature from filesystem assertions. A filesystem assertion checks the existence, type, or attributes of a specific path. Checksum verification checks the relationship between a checksum file and a set of target files, and can be run explicitly in a CI job, e.g. `sha256sum --strict --check checksums.txt`.

Embedding checksum verification into the action would force decisions about digest algorithms, checksum file formats, GNU `sha256sum` vs BSD `shasum` differences, extra entries in the checksum file, matching rules against manifest subjects, and multiple checksum files. All of this widens the action far beyond path assertions.

## Decision

`fs-assert-action` must not perform checksum verification.

The action covers the filesystem assertions that are the precondition of checksum verification: the checksum file and the target archives exist at the expected paths, are regular files, and (where relevant) are readable as tarballs. The CI job then runs checksum verification itself:

```yaml
- name: Assert release files
  uses: tooppoo/fs-assert-action@v0
  with:
    root: dist
    manifest: |
      version: 1
      subjects:
        - path: checksums.txt
          assertions:
            - exists
            - is_regular_file

        - path: app_Linux_x86_64.tar.gz
          assertions:
            - exists
            - is_regular_file
            - is_tarball

- name: Verify checksums
  working-directory: dist
  run: sha256sum --strict --check checksums.txt
```

## Alternatives Considered

### Built-in checksum assertion

A `checksum` assertion would make the release flow self-contained, but it drags algorithm and file-format policy into the action and duplicates what one explicit shell command already does portably. Not selected for v0.

## Consequences

### Positive Consequences

- The action's responsibility stays simple
- The boundary between filesystem assertion and digest verification is explicit
- Users can read the checksum verification step directly in their CI job
- The action stays useful for filesystem assertions unrelated to release artifacts

### Negative Consequences

- Release archive verification does not complete inside the action alone
- Users must write a separate checksum verification step
- The action does not guarantee that the checksum file and the manifest subjects match exactly

### Neutral Consequences

- Checksum verification may later be added as a separate action or assertion, but it will be considered apart from the core responsibility of `fs-assert-action`
