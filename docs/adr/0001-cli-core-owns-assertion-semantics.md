# ADR 0001: assertion semantics は CLI / core を正本とし、GitHub Action はadapterとする

## Status

Accepted

## Context

`fs-assert` が扱う filesystem assertion は、GitHub Actions 固有の処理ではない。

manifest は、期待される file / artifact 構成を検証可能な contract として記述するものである。そのため、manifest schema、validation、変数補間、assertion execution、diagnostics model を GitHub Action 側に閉じ込めると、次の問題が生じる。

- GitHub Actions 以外で同じ assertion を実行しにくい。
- CLI 利用、fixture test、download 済み artifact の検証で semantics を再利用しにくい。
- Action と CLI で manifest parsing や assertion execution が二重実装されやすい。
- GitHub Actions expression syntax が manifest 仕様に混入しやすい。

## Decision

`fs-assert` の assertion semantics は CLI / core を正本とする。

CLI / core は次を所有する。

- manifest schema
- manifest validation
- 変数補間
- assertion execution
- diagnostics model

GitHub Action は GitHub Actions 向け adapter として提供する。Action は次を担う。

- `manifest` / `manifest_file` input の受け取り
- GitHub Actions で評価済みの値を CLI / core へ明示的に渡す I/F
- CLI / core の実行
- structured diagnostics の GitHub annotation / step summary への変換

Action 側で manifest parsing や assertion execution を重複実装しない。

## Consequences

- 同じ manifest semantics を CLI、CI、fixture test、GitHub Action で共有できる。
- GitHub Actions に依存せずに artifact 検証器をテストできる。
- Action は GitHub Actions UX に責務を限定できる。
- Action 実装方式、たとえば JavaScript Action にするか composite Action にするかは別Issueで決める。
- 変数補間は GitHub Actions expression syntax ではなく、`fs-assert` 側の仕様として設計する必要がある。
