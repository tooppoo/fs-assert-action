# Manifest format

`fs-assert-action` takes an inline YAML manifest via the `manifest` input. The manifest declares, per subject path, the list of assertions to run.

## Structure

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

| Key | Type | Description |
| --- | --- | --- |
| `version` | integer | Manifest schema version. Must be `1`. |
| `subjects` | array | Subjects to verify. |
| `subjects[].path` | string | Path relative to the `root` input. Absolute paths and paths resolving outside `root` are rejected (see [security.md](./security.md)). |
| `subjects[].assertions` | array | Assertions to run against the path. Must not be empty. |

No other keys are accepted; unknown keys are manifest errors.

## Assertion entries

An assertion is written either as a string (no arguments) or as a single-key mapping (with arguments):

```yaml
# assertion without arguments
- exists

# assertion with arguments
- line_count:
    equals: 2
```

Assertion names are dispatched against a fixed allowlist. An unknown assertion name fails the action as a manifest error before any assertion runs. See [assertions.md](./assertions.md) for the supported assertions.

## Errors

The action fails without running any assertion when:

- the manifest is not valid YAML
- `version` is not `1`
- the structure deviates from the table above (unknown keys, wrong types, empty `assertions`)
- an assertion name is not in the allowlist
- arguments are passed to an assertion that takes none, or `line_count` arguments are invalid

When the manifest is valid, all assertions of all subjects are executed and every failure is reported; the action fails if at least one assertion fails.
