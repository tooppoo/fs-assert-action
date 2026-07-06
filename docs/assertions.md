<!-- Generated from src/assertions/*.ts by `npm run gen:docs`. Do not edit by hand. -->

# Supported assertions

Assertion names are snake_case. Assertions that test a file type or file attribute use the `is_` prefix. Assertions on quantities (such as `line_count`) do not.

All assertions follow symlinks when inspecting the target.

## `exists`

The path exists (file, directory, or anything else reachable via `stat`).

```yaml
- exists
```

## `is_regular_file`

The path exists and is a regular file (not a directory, symlink to a directory, FIFO, etc.).

```yaml
- is_regular_file
```

## `is_executable`

The path exists, is a regular file, and has at least one execute permission bit set (owner, group, or other). This is a POSIX permission check; on Windows runners it is not meaningful.

```yaml
- is_executable
```

## `is_tarball`

The path exists, is a regular file, and can be listed as a tar archive by `tar -tf` (which auto-detects gzip and other supported compression). The assertion passes when `tar` exits with status 0.

This assertion does not extract the archive and does not verify entries inside it. To verify archive contents, extract the archive in your workflow and run the action again with the extracted directory as `root` (see the [README](../README.md#archives-are-not-extracted)).

```yaml
- is_tarball
```

## `line_count`

The path exists, is a regular file, and has exactly the expected number of lines.

```yaml
- line_count:
    equals: 2
```

- Lines are separated by `\n` (a `\r\n` sequence counts as one line break).
- A trailing newline does not add an extra line: a file containing `a\nb\n` has 2 lines.
- An empty file has 0 lines.
- v0 supports only `equals` (a non-negative integer). `greater_than` / `less_than` / ranges are not supported.

## Not supported in v0

The following assertions are intentionally not implemented in v0:

- `directory`
- `non_empty`
- `max_size`
- `tar_contains`
