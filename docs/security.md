# Security

`fs-assert-action` inspects the filesystem, so it constrains what a manifest can reach.

## Path containment

- Only paths under the `root` input are verified.
- Absolute subject paths are rejected.
- Subject paths that resolve outside `root` (e.g. `../../etc/passwd`) are rejected.

Containment is checked by lexical path resolution: the subject path is resolved against `root`, and the result must stay inside `root`. Note that if a path inside `root` is a symlink pointing outside `root`, assertions follow the symlink target; place trusted content under `root`.

## Assertion allowlist

Assertion names are dispatched against a fixed allowlist. Unknown assertion names are rejected as manifest errors before any assertion runs. The action never executes user-defined code from the manifest.

## Archives

- The action never extracts archives.
- The action never verifies entries inside an archive; `is_tarball` only reads the first tar header block to check that the file is readable as a tarball.

## What the action reads

The action only reads:

- metadata (`stat`) of subject paths
- file contents of subjects with `line_count` (full read) or `is_tarball` (first bytes only)

It writes nothing and executes nothing.
