# Parlinter

A low-friction linter for Lisp that finally allows your team members to use [Parinfer].

Unlike full pretty-printers, it preserves as much of the original source as
possible, only fixing _confusing indentation_ and _dangling close-parens_. But
it's still flexible, allowing any-space indentation within thresholds.

Adopt Parlinter to make your project Parinfer friendly!

![parinfer friendly](https://img.shields.io/badge/parinfer-friendly-ff69b4.svg)

## Want a Quick Look?

- See concrete examples of [Common Lint Results in Clojure].
- See the only [Two Rules] it follows.
- [Try it out on your project] then check `git diff -w` to verify the minor changes.

[Common Lint Results in Clojure]:#common-lint-results-in-clojure
[Two Rules]:#two-rules
[Try it out on your project]:#install

## Two Rules

Parlinter performs minimal source transformation in order to satisfy two rules:

### Rule #1 - no dangling close-parens

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

### Rule #2 - no confusing indentation

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

> Want to use as a plugin in your build environment instead? (e.g. lein, boot)  Help wanted! Please [create an issue].

[create an issue]:https://github.com/shaunlebron/parlinter/issues/new

## Usage

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

Verify non-whitespace changes below for peace-of-mind:  (AST not changed)

```
git diff -w
```

Check if all clojure files are properly formatted (non-zero exit code if not):

```
$ parlinter -l "**/*.{clj,cljs,cljc,edn}"
```

## Performance

It takes ~0.5s to run against ~40k lines. (tested on the [Clojure] and [ClojureScript] project repos)

It was heavily optimized to allow [Parinfer] to run at 60hz on a ~3k line file
while typing.

[Clojure]:https://github.com/clojure/clojure
[ClojureScript]:https://github.com/clojure/clojurescript

## Compatibility

_Syntactically_ compatible with Clojure, Racket, Scheme, and other Lisps that follow this syntax:

- delimiters `(`, `{`, `[`
- strings `"`
- characters `\`
- comments `;`

_Culturally_ compatible with standard Lisp styles\*:

- [Lisp Indentation]
- [Clojure Style Guide]
- [Google Common Lisp Style Guide]
- [Racket Style Guide]

> _\* some allow close-parens on their own line, but still allow them to be
removed as Parlinter does_

[Lisp Indentation]:http://wiki.c2.com/?LispIndentation
[Racket Style Guide]:http://docs.racket-lang.org/style/Textual_Matters.html
[Google Common Lisp Style Guide]:https://google.github.io/styleguide/lispguide.xml

## Common Lint Results in Clojure

A collection of common changes performed by Parlinter on Clojure code—the
Lisp I am most familiar with.

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

## Motivation

Though [Parinfer] was designed to lower the barrier for newcomers, it faced a
problem of practicality by not allowing them to collaborate smoothly with people
who didn't use it. This friction was not part of the intended experience.

Par<em>linter</em> was designed as an answer to this problem, since there now seems to be
a growing acceptance of linters and even full-formatters like [Prettier],
[refmt], and [gofmt] from other language communities.

Thus, I hope that Parlinter at least spurs some thoughts on what is an
acceptable amount of process around linting in Lisp, whether or not Parinfer is
worth linting for, and how else we can help newcomers get into Lisp easier.

(It may also open the door for some exciting next-gen things I'm not yet ready
to talk about.)

Written for Lisp with <3

[Prettier]:https://github.com/prettier/prettier
[refmt]:https://facebook.github.io/reason/tools.html#tools-command-line-utilities-refmt
[gofmt]:https://golang.org/cmd/gofmt/

[clojure.pprint]:https://clojure.github.io/clojure/clojure.pprint-api.html
[clojure-mode]:https://github.com/clojure-emacs/clojure-mode
[fipp]:https://github.com/brandonbloom/fipp
[cljfmt]:https://github.com/weavejester/cljfmt
[zprint]:https://github.com/kkinnear/zprint


[Clojure Style Guide]:https://github.com/bbatsov/clojure-style-guide
[Parinfer]:http://shaunlebron.github.io/parinfer/
