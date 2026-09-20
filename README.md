# Autolith website

Static HTML generated with Common Lisp and [HSX](https://github.com/skyizwhite/hsx).
The browser receives HTML, CSS and plain ES modules. Node is used only for tests.

## Edit

- `content/*.sexp`: page copy, one file per section. Keys match calls in the
  corresponding `src/sections/*.lisp` component.
- `content/site.sexp`: page title, description, canonical URL and shared links.
- `content/commands.sexp`: shared installation commands.
- `src/components.lisp`: navigation, command blocks and decorative figures.
- `src/sections/`: HSX section components, including diagrams and code examples.
- `src/page.lisp`: page metadata and section order.
- `public/`: files copied to the output, including CSS, JS, fonts and recordings.
- `vendor/`: pinned Lisp source dependencies and licenses.
- `src/edit/`, `public/edit/`: the local editor described under Edit in place.

Copy files are data, read with reader evaluation disabled. Use strings and a
small inline vocabulary: `:em`, `:strong`, `:b`, `:i`, `:code`, `:kbd`, `:span`,
`:a`, and `:br`. Each inline element has an attribute list followed by children:

```lisp
(:title ("A live " (:em () "Common Lisp") " agent")
 :prose ("Read the " (:a (:href "https://github.com/lambda-symbolics/autolith")
                       "source") "."))
```

Missing keys, duplicate keys, invalid markup and unreadable data fail the build.
Use HSX for layout and reusable components; use copy files for prose. Org-mode
conversion is unnecessary for this page.

## Edit in place

```sh
./script/edit
```

This starts a local editing server on <http://127.0.0.1:7777/>, or on a port
given as the first argument. It renders the page from `content/` on every
request and writes edits straight back to those files, so it is a development
tool rather than part of the deployment. It listens on the loopback interface,
performs no authentication and has no undo beyond Git.

Click any prose on the page and type. `Ctrl-B` wraps the selection in `:strong`,
`Ctrl-I` in `:em`, `Ctrl-K` in a link to an `https://` URL or a `#anchor`, and
`Ctrl-\` strips markup from it. `Enter` inserts a line break, and `Escape`
leaves the field. A field saves when it loses focus, and `Ctrl-S` saves every
pending change. Copy with no place on the page, such as the page title, the
canonical URL and the installation commands, is in the panel at the bottom
right.

Saves keep each file's leading comment and rewrite the rest of it with one key
per line. Markup outside the vocabulary in `content/` is refused with a message
and the file is left alone. Text is normalized the way a browser normalizes it,
so hand-written leading and trailing spaces inside a copy string collapse on
the first save.

The editing server serves the page with headline splitting disabled, which
keeps the DOM stable while a heading is edited. Its own assets live in
`public/edit/` and are excluded from `dist/`; its Lisp dependencies belong to
the separate `autolith-www/edit` system, which `./script/build` never loads.

## Build

```sh
./script/build
```

Serve `dist/` with any static HTTP server. A source build uses SBCL on `PATH`.
On Linux x86-64 without SBCL, the bootstrap downloads the pinned SBCL 2.4.0
binary, verifies its SHA-256 and installs it under `.cache/`. All Lisp
library sources are vendored, so no Quicklisp setup or dependency download is
needed. Downloading the runtime requires `curl`, `tar`, `bzip2` and `sha256sum`.
On other platforms, install SBCL first.

```sh
SITE_DOWNLOAD_SBCL=1 ./script/build
```

Use that command to exercise the downloadable runtime even with a local SBCL.
This binary supports glibc 2.34, as provided on Vercel's build host. Local
page generation takes about 15 ms; runtime download and initial compilation
add several seconds. Build caches are disposable; content is read afresh on
every invocation. Only `dist/` is published.

## Check

```sh
npm ci
npx playwright install chromium
./script/check
```

With an existing Chromium, use `CHROMIUM=/path/to/chromium ./script/check`.
Checks cover copy validation, escaping, deterministic HTML, JS syntax, internal
anchors, desktop and mobile rendering, keyboard tabs and navigation, motion
preferences, no-JavaScript content and automated WCAG A/AA checks with axe.
Screenshots are written to `test-results/` for visual review. Automated checks
do not constitute an accessibility certification.

## Browser code

`public/js/main.js` initializes independent enhancements. Navigation and tabs
are separate from the reader demonstration, diagrams, tower and decorative
figures. The reader demonstrates prompt syntax; it does not execute Lisp.
The asciinema player is downloaded only when a recording is requested.

The palette is black ink on off-white `#fffefa`, with green accents and one-bit
dither. The footer is inverted. Animations run by default regardless of system
motion preferences. Core copy and installation panels are available without
JavaScript. `?still=1` selects static figures, `?stage=0|1|2`
selects a reader-morph stage, and `?t=<seconds>` advances the tower for a capture.

## Deploy

The existing Vercel project is `autolith-www`, currently at
[autolith-www.vercel.app](https://autolith-www.vercel.app).
`vercel.json` selects the Other framework, `./script/build`, and `dist/`.
The install step deliberately skips test-only npm dependencies.

```sh
vercel link --project autolith-www
vercel deploy --prod --yes
```

Keep `.vercel/` local. Update the URL in `content/site.sexp` when assigning a
permanent domain. Build duration and total deployment latency are separate.

## Assets and provenance

Fonts, logos and artwork were carried over from the existing site, originally
sourced from `lambda-symbolics/ls-landing`. The recordings and asciinema player
are also retained. Dependency versions and licenses are listed in
`vendor/README.md`. Repository practices in `AGENTS.md` are adapted from Autolith.
