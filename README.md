# Parlinter

A friendly linter to allow [Parinfer] usage on your Lisp project. Rationale:

- Parinfer creates noisy diffs on team projects, because it must lint before
  opening files to work correctly.
- But Parinfer tidies up code in a style compliant with most Lisp styles anyway.
- A project-level linter can automate this tidiness while allowing others to opt-in to Parinfer.

## Include newcomers on your project

If you think [Parinfer] is a good tool to welcome newcomers into Lisp, you can
make it possible for them to contribute to your project by adopting this small
linter. They will thank you, and you will thank them!

Make your project Parinfer friendly!

![parinfer friendly](https://img.shields.io/badge/parinfer-friendly-ff69b4.svg)

## Want a Quick Look?

- See concrete examples of [Common Lint Results in Clojure]
- See the only [Two Rules] it follows (and how other formatters comply).
- [Try it out on your project] then check `git diff -w` to verify the minor changes.

[Common Lint Results in Clojure]:#common-lint-results-in-clojure
[Two Rules]:#two-rules
[Try it out on your project]:#usage

## Two Rules

Unlike full pretty-printers like [cljfmt] or [zprint], Parlinter preserves as
much of the original styling as possible.

### Rule #1

Close-parens at the beginning of a line are moved to the end of its previous
token:

> __Key__: We use `---` instead of `foo` or `bar` to draw your eye towards parens and holistic forms.

```clj
;; bad
(--- (---
   ) ---
 ) ^
 ^

;; fixed
(--- (---)
    ---) ^
       ^
```

> __Conventional Formatters__ comply with Rule #1 for all cases except to allow
> [close-parens after a comment].  Parlinter does NOT make this exception.

[close-parens after a comment]:#2-close-parens-after-comments

### Rule #2

Indentation is kept to the RIGHT of the parent open-paren, without crossing the
threshold of another:

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

> __Conventional formatters__ comply with Rule #2 for all cases, except
> [clojure.pprint] and older versions of [clojure-mode], which cause extra indentation
> of [multi-arity function bodies].

[Compatibility]:#compatibility
[multi-arity function bodies]:#1-multi-arity-function-bodies

## Install

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

## Try it out

Format all clojure files:

```
parlinter --trim --write "**/*.{clj,cljs,cljc,edn}"
```

Verify non-whitespace changes below for peace-of-mind:  (AST not changed)

```
git diff -w
```

Check if all clojure files are properly formatted (non-zero exit code if not):

```
$ parlinter -l "**/*.{clj,cljs,cljc,edn}"
```

## Performance

The examples above take ~0.5s to run against the [Clojure] and [ClojureScript]
project repos.

[Clojure]:https://github.com/clojure/clojure
[ClojureScript]:https://github.com/clojure/clojurescript

## Common Lint Results in Clojure

A collection of common changes performed by Parlinter.

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
(foo (bar
"Hello
world"))

;; fixed
(foo (bar
      "Hello
world"))    ;; <-- not nudged
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

### 7. Vertically-aligned comments

Linting may throw off the alignment of comments, due to paren movement:

```clj
;; bad
(let [foo 1  ; this is number one
      bar 2  ; this is number two
      ]
  (+ foo bar))

;; fixed
(let [foo 1  ; this is number one
      bar 2]  ; this is number two
  (+ foo bar))
```

## Par-linter vs Par-infer

Sorry if the similar name to [Parinfer] is confusing.  Parlinter is the same
tool, but serves a distinct purpose—to allow users who don't use Parinfer to
interface with those who do. Hence the separate name:

- Par-__linter__ - lint files to allow paren inference
- Par-__infer__ - infer parens while manipulating linted files

I pronounce both by rhyming "far", then pronouncing the next word as it is.

[clojure.pprint]:https://clojure.github.io/clojure/clojure.pprint-api.html
[clojure-mode]:https://github.com/clojure-emacs/clojure-mode
[fipp]:https://github.com/brandonbloom/fipp
[cljfmt]:https://github.com/weavejester/cljfmt
[zprint]:https://github.com/kkinnear/zprint

[Parinfer]:http://shaunlebron.github.io/parinfer/
