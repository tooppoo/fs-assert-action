# Use YAML manifest

- Status: Accepted
- Created: 2026-07-06T03:53:14Z

## Context

`fs-assert-action` runs assertions against filesystem paths on GitHub Actions. The assertion targets are declared in a manifest. The candidate formats were JSON and YAML.

JSON integrates well with a JavaScript / TypeScript implementation. However, GitHub Actions workflows are themselves written in YAML, so when an inline manifest is embedded in `with.manifest`, JSON is hard to read. YAML embeds naturally as a block scalar:

```yaml
- name: Assert files
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
            - line_count:
                equals: 2
```

TypeScript / JavaScript cannot parse YAML with standard library features alone, so v0 accepts a minimal runtime dependency on a YAML parser.

## Decision

The manifest format of `fs-assert-action` must be YAML.

The action's public inputs are:

- `root`: the base directory for assertions
- `manifest`: an inline YAML string

Public inputs that point at a manifest file (`manifest-path` / `manifest_file`, etc.) must not be provided in v0.

The manifest is not a fixed set of configuration keys; it is a list of assertions per subject:

```yaml
version: 1
subjects:
  - path: checksums.txt
    assertions:
      - exists
      - is_regular_file
      - line_count:
          equals: 2
```

Assertion names in v0 must be snake_case. Assertions that test a file type or file attribute must use the `is_` prefix:

```text
is_regular_file
is_executable
is_tarball
```

Line count verification is a quantity check, not a predicate, so it is named `line_count` without the `is_` prefix. `exists` is kept as-is as the existence assertion.

The only assertion that takes arguments in v0 is `line_count`.

## Alternatives Considered

### JSON manifest

Parses with `JSON.parse` and needs no dependency, but inline JSON inside workflow YAML is noisy and error-prone to hand-edit. Not selected because inline usage is the primary v0 interface.

### Manifest file input

A `manifest-path`-style input would support large manifests, but it widens the input surface and the file-loading semantics (relative to what? checkout timing?) before any concrete need exists. Deferred until the need is demonstrated.

## Consequences

### Positive Consequences

- Inline manifests read naturally inside workflow YAML
- Small use cases need no extra manifest file
- The action's public input surface stays small
- The subject/assertion-list model maps directly onto the format
- snake_case and the `is_` prefix make predicate assertions recognizable

### Negative Consequences

- A YAML parser dependency is required
- Large manifests may become hard to read inside a workflow
- Because YAML is more expressive than JSON, the manifest loader must strictly restrict the accepted structure

### Neutral Consequences

- Whether to support a manifest file input is revisited after v0 when the need becomes concrete

## Notes

The manifest structure accepted in v0 is limited to:

- a root mapping
- integer `version`
- array `subjects`
- string `subjects[].path`
- array `subjects[].assertions`
- string assertions
- a single-key mapping assertion for `line_count`
