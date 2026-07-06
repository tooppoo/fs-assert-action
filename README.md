# fs-assert-action

`fs-assert-action` verifies filesystem paths in GitHub Actions. `fs` stands for *filesystem*: the action asserts the existence, type, and attributes of paths declared in a YAML manifest.

Typical use case: verifying release archives before publishing — the expected files exist, are regular files, are readable as tarballs, executables have their execute bit set, and a checksums file has the expected number of lines.

## Usage

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
            - line_count:
                equals: 2

        - path: app_Linux_x86_64.tar.gz
          assertions:
            - exists
            - is_regular_file
            - is_tarball
```

More examples are in [examples/](./examples/).

## Inputs

| Input | Required | Description |
| --- | --- | --- |
| `root` | yes | Root directory for path assertions. All manifest paths are resolved relative to this directory. |
| `manifest` | yes | Inline YAML manifest. See [docs/manifest.md](./docs/manifest.md). |

There is no input that points at a manifest file; v0 supports inline manifests only.

## Supported assertions (v0)

| Assertion | Checks |
| --- | --- |
| `exists` | the path exists |
| `is_regular_file` | the path is a regular file |
| `is_executable` | the file has an execute bit set |
| `is_tarball` | the file is readable as a (optionally gzipped) tar archive |
| `line_count` | the file has exactly `equals` lines |

Details: [docs/assertions.md](./docs/assertions.md).

## Scope

### Checksum verification is not included

Checksum verification relates a checksum file to target files and is best run as an explicit CI step. This action only asserts the preconditions (the files exist and have the expected shape); run the verification yourself:

```yaml
- name: Verify checksums
  working-directory: dist
  run: sha256sum --strict --check checksums.txt
```

### Archives are not extracted

This action never extracts archives and never verifies entries inside an archive. To verify archive contents, extract the archive in your workflow and call the action again with the extracted directory as `root`:

```yaml
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

### GitHub Actions artifacts are not handled

This action does not download or upload GitHub Actions artifacts. Use `actions/download-artifact` or `actions/upload-artifact` separately.

## Security

- Absolute paths in the manifest are rejected.
- Paths resolving outside `root` are rejected.
- Assertion names are dispatched against a fixed allowlist; the manifest cannot execute arbitrary code.

Details: [docs/security.md](./docs/security.md).

## Development

```sh
npm ci
npm run typecheck
npm run build      # bundles src/ into dist/index.js
npm run gen:docs   # regenerates docs/assertions.md from src/assertions/*.ts
```

`dist/index.js` is committed to the repository because `action.yml` runs it directly (`runs.using: node20`). Each assertion's documentation lives in its own `src/assertions/*.ts` file (the `doc` field) and [docs/assertions.md](./docs/assertions.md) is generated from it. CI fails if `dist/` or `docs/assertions.md` is out of sync with `src/`.

## License

[Apache-2.0](./LICENSE)
