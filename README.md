# Parlinter

A minimal formatting linter for Lisp projects.

Its key feature is that it allows project collaborators to use [Parinfer] in
their editors without forcing others to do so.

Works on most Lisp dialects! (e.g. Clojure, Racket, Scheme)

## Rationale

Unlike full pretty-printers like [clojure.pprint], [fipp], [cljfmt], and
[zprint], Parlinter preserves as much of the original styling as possible. The
hope is that it serves as a compromise for teams that wish to maintain
flexibility of alignment preferences while also enabling users (especially
newcomers) to enjoy the power of [Parinfer]—without imposing large
formatting-related diffs in their commits.

[Parinfer]:http://shaunlebron.github.io/parinfer/

## Styling Rules

__Close-Parens__: No other tokens will ever be moved to a different line, but
close-parens at the beginning or end of a line will be moved flush against their
previous token.

```clj
;; bad
(foo
  (bar
    baz
    )
  )

;; fixed by Parlinter
(foo
  (bar
    baz))
```

__Indentation__: Whether you prefer 2-space indentation or token-aligned
indentation, your style will be preserved as long as it falls within Parinfer's
thresholds (determined by open-parens).  Offending lines are nudged to the
closest threshold, while preserving relative indentation of the affected child
expressions.

```clj
;; fine
(foo bar
     baz)

;; fine
(foo bar
  baz)
```

```clj
;; bad
(foo
(bar
   baz))

;; fixed by Parlinter
(foo
 (bar     ;; <-- minimally nudged
    baz)) ;; <-- relative indentation maintained after nudge
```

[clojure.pprint]:https://clojure.github.io/clojure/clojure.pprint-api.html
[fipp]:https://github.com/brandonbloom/fipp
[cljfmt]:https://github.com/weavejester/cljfmt
[zprint]:https://github.com/kkinnear/zprint

## Notable Styles affected

TODO: Verify compatibility with [clojure-mode] and others?

[clojure-mode]:https://github.com/clojure-emacs/clojure-mode#indentation-options

TODO example: JSON style data

TODO example: Multi-arity function bodies

TODO example: Comment lines at end of a list

TODO example: `comment` forms

TODO example: `#_` ignore forms

## Usage

```
npm install -g parlinter
or
yarn global add parlinter
```

```
$ parlinter

Usage: parlinter [opts] [filename|glob ...]

Available options:
  --write                  Edit the file in-place. (Beware!)
  --trim                   Trim trailing whitespace.
  --list-different or -l   Print filenames of files that are different from Parlinter formatting.
  --stdin                  Read input from stdin.
  --version or -v          Print Parlinter version.
```

[Glob patterns](https://github.com/isaacs/node-glob#glob-primer) must be quoted.

## Examples

Format all clojure files

```
parlinter --trim --write "**/*.@(clj|cljs|cljc|edn)"
```

Check if all clojure files are properly formatted (non-zero exit code if not):

```
parlinter -l "**/*.@(clj|cljs|cljc|edn)"
```
