# Parlinter

Allow [Parinfer] on a Lisp team with this friendly linter. Rationale:

- Parinfer creates noisy diffs on team projects, because it must lint before
  opening files to work correctly.
- If a team likes (or can tolerate) Parinfer-style code, a project-level linter
  can make it easy to integrate.

[Parinfer]:http://shaunlebron.github.io/parinfer/

## Two Rules

Unlike full pretty-printers like [cljfmt] or [zprint], Parlinter preserves as
much of the original styling as possible.

__Rule #1__ - Close-parens at the beginning of a line are moved to the end
of its previous token:

```clj
;; bad
(--- (---
   ) ---
 ) ^
 ^

;; fixed
(--- (---)
     ---)^
        ^
```

__Rule #2__ - Indentation is kept to the RIGHT of the parent open-paren, without
crossing the threshold of another:

```clj
;; bad
(--- (---)
---)

;; fixed
(--- (---)
 ---)      ;; <-- nudged to the right
```

```clj
;; bad
(--- (---)
      ---)

;; fixed
(--- (---)
     ---)  ;; <-- nudged to the left
```

See [Implications in Clojure] for clarity using real examples.

See [Compatibility] with existing formatters.

[Implications in Clojure]:#implications-in-clojure
[Compatibility]:#compatibility

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
  --trim                   Remove lines that become empty after linting.
  --list-different or -l   Print filenames of files that are different from Parlinter formatting.
  --stdin                  Read input from stdin.
  --version or -v          Print Parlinter version.
```

[Glob patterns](https://github.com/isaacs/node-glob#glob-primer) must be quoted.

## Examples

Format all clojure files:

```
parlinter --trim --write "**/*.{clj,cljs,cljc,edn}"
```

Check if all clojure files are properly formatted (non-zero exit code if not):

```
parlinter -l "**/*.{clj,cljs,cljc,edn}"
```

## Compatibility

TODO: check compatibility with:

- [clojure.pprint] data
- [clojure-mode] code and data
- [fipp] data
- [cljfmt] code
- [zprint] code

[clojure.pprint]:https://clojure.github.io/clojure/clojure.pprint-api.html
[clojure-mode]:https://github.com/clojure-emacs/clojure-mode
[fipp]:https://github.com/brandonbloom/fipp
[cljfmt]:https://github.com/weavejester/cljfmt
[zprint]:https://github.com/kkinnear/zprint

## Common Results in Clojure

A collection of common changes performed by the linter.

### 1. Multi-arity function bodies

Sometimes function bodies for multi-arity functions are indented past the
function params.

```clj
;; bad
(defn foo
  "I have two arities."
  ([x]
    (foo x 1))
  ([x y]
    (+ x y)))

;; fixed
(defn foo
  "I have two arities."
  ([x]
   (foo x 1))
  ([x y]
   (+ x y)))
```

### 2. Close-parens after comments

Since close-parens cannot be at the beginning of a line, they cannot come after
comments.

```clj
;; bad
(-> 10
    (foo 20)
    (bar 30)
    ;; my comment
    )

;; fixed
(-> 10
    (foo 20)
    (bar 30))
    ;; my comment
```

### 3. Lines inside strings are not touched

Indentation of lines inside multi-line strings is significant, so it is not
modified:

```clj
;; bad
(foo
"Hello
world")

;; fixed
(foo
 "Hello
world")    ;; <-- not nudged
```

### 4. Recessed function bodies

Function bodies are sometimes indented to its grandparent form rather than its
parent:

```clj
;; bad
(foo bar (fn [a]
  (println a)))

;; fixed
(foo bar (fn [a]
          (println a))) ;; <-- nudged to be inside "(fn"
```

### 5. Recessed lines after JSON-style `{`

It is sometimes common to use JSON-style indentation in a top-level EDN config:

```clj
;; bad
:cljsbuild {
  :builds [...]
}

;; fixed
:cljsbuild {
            :builds [...]} ;; <-- nudged to be inside "{"

;; fine (but not automated)
:cljsbuild {:builds [...]}

;; fine (but not automated)
:cljsbuild
{:builds [...]}
```

### 6. Recessed lines after `#_` and `comment`

Comment and ignore forms are commonly added retroactively without adjusting
indentation:

```clj
;; bad
#_(defn foo []
  (bar baz))

;; fixed
#_(defn foo []
   (bar baz))
```

```clj
;; bad
(comment
(defn foo []
  (bar baz))
)

;; fixed
(comment
 (defn foo []
   (bar baz)))
```
