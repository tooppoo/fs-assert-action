# ADR 0002: `fs-assert-action` を `fs-assert` にrenameし、旧path互換は提供しない

## Status

Accepted

## Context

`fs-assert-action` という名称は、GitHub Action が主たる成果物であるように見える。

今後は CLI / core を主実装とし、GitHub Action は adapter として提供する。そのため、プロダクト名、CLI名、repository名、GitHub Action の uses path を `fs-assert` に揃える。

現時点では利用箇所を新しい repository / Action path へまとめて変更できるため、旧path互換は提供しない。

## Decision

- プロダクト名・CLI名を `fs-assert` とする。
- GitHub repository名を `fs-assert` に変更する。
- GitHub Action は `tooppoo/fs-assert/action@...` として提供する。
- 旧 `tooppoo/fs-assert-action` path の互換性は提供しない。
- 既存の利用箇所は、新しい repository / Action path へ揃えて変更する。

## Consequences

- CLI / core 主体のツールであることが名称から読み取りやすくなる。
- GitHub Action は `fs-assert` の一部として扱われる。
- 既存の `uses: tooppoo/fs-assert-action@...` は更新が必要になる。
- rename の実施タイミング、既存利用箇所の更新順序、tag 運用は後続Issueで扱う。
