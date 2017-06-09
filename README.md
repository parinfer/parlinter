# Parlinter

Allow [Parinfer] usage on a team project with this friendly linter.

Parinfer editors already lint files before opening them to make its special
inference work, but performing this as a project-level linter solves the noisy
diff problem that happens when used only in isolation.

Unlike full pretty-printers like [clojure.pprint], [fipp], [cljfmt], and
[zprint], Parlinter preserves as much of the original styling as
possible—allowing teams to maintain some flexibility of style preferences while
also enabling users (especially newcomers) to enjoy the power of Parinfer.

[Parinfer]:http://shaunlebron.github.io/parinfer/

## Two Simple Rules

__Close-Parens__ at the beginning or end of a line are flushed against
their previous token.

```clj
;; bad
(foo
  (bar
    baz
    )
  )

;; fixed
(foo
  (bar
    baz))
```

__Indentation__ of a line must be kept to the RIGHT of its parent open-paren, without
crossing the threshold of another.

```clj
 (foo (bar)
; ^   ^     ;; <-- min/max indentation points of the following line
    ...)

;; fine
(foo (bar)
  baz)

;; fine
(foo (bar)
     baz)

;; bad
(foo (bar)
baz)        ;; <-- fixed by indenting +1

;; bad
(foo (bar)
      baz)  ;; <-- fixed by indenting -1
```

[clojure.pprint]:https://clojure.github.io/clojure/clojure.pprint-api.html
[fipp]:https://github.com/brandonbloom/fipp
[cljfmt]:https://github.com/weavejester/cljfmt
[zprint]:https://github.com/kkinnear/zprint


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

## Implications in Clojure

Following examples in Clojure.

TODO: Verify compatibility with [clojure-mode] and others?

[clojure-mode]:https://github.com/clojure-emacs/clojure-mode#indentation-options

### 1. Multi-arity function bodies

```clj
```

### 2. Comment lines at end of a list

```clj
```


### 3. Recessed lines

Function bodies are sometimes indented to its grandparent form rather than its
parent:

```clj
;; bad
(foo bar (fn [a]
  (println a)))

;; minimal fix by Parlinter
(foo bar (fn [a]
          (println a))) ;; <-- nudged to be inside "(fn"
```

Same thing is seen when JSON-style indentation is used for maps:

```clj
;; bad
:cljsbuild {
  :builds [...]
}

;; minimal fix by Parlinter
:cljsbuild {
            :builds [...]} ;; <-- nudged to be inside "{"

;; fine (but not automated)
:cljsbuild {:builds [...]}

;; fine (but not automated)
:cljsbuild
{:builds [...]}
```

Comment and ignore forms are commonly added retroactively without adjusting
indentation:

```clj
;; bad
#_(defn foo []
  (bar baz))     ;; <-- will be nudged by Parlinter

;; bad
(comment
(defn foo []     ;; <-- will be nudged by Parlinter
  (bar baz))
)
```
