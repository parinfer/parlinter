# 1.3.0

- fix `--list-different` option (see [#4](https://github.com/shaunlebron/parlinter/pull/4), thanks [@zhanjing1214](https://github.com/zhanjing1214))
  - only prints filenames of those unformatted
  - returns correct exit code (1 for unformatted file is found, 0 otherwise)

# 1.2.0

- update to Parinfer 3.9.0
  - shift comment indentation when parent forms are shifted
  - [extend indentation contraints](https://github.com/shaunlebron/parinfer/blob/master/lib/test/cases/paren-mode.md#extending-indentation-constraints) for better stability

# 1.1.0

- update to Parinfer 2.2.1
  - fix: do not process if unmatched close-parens found anywhere

# 1.0.1

- fix `parlinter` binary publish

# 1.0.0

- Public release (readme changes)
- `--trim` removes lines that become empty after linting

# 0.1.0

- Initial early release
