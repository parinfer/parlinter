# Parlinter

A minimal formatting linter for Lisp projects, allowing collaborators to edit
with [Parinfer] without forcing others to do so.

[Parinfer]:http://shaunlebron.github.io/parinfer/

This is NOT a full pretty-printer like [clojure.pprint], [fipp], [cljfmt], and
[zprint]. Original styling is preserved as much as possible.  The few styling
rules are: indentation is minimally adjusted to stay within thresholds and
close-paren positions are normalized.

[clojure.pprint]:https://clojure.github.io/clojure/clojure.pprint-api.html
[fipp]:https://github.com/brandonbloom/fipp
[cljfmt]:https://github.com/weavejester/cljfmt
[zprint]:https://github.com/kkinnear/zprint

Works on most Lisp dialects! (e.g. Clojure, Racket, Scheme)

## Usage

```
npm install -g parlinter
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
