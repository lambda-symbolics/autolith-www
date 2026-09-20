# In-place copy editor

A local editing server for `content/*.sexp`, in the spirit of Simpla: click a
paragraph on the rendered page, type, and the source file changes. It is a
development tool. The static deployment path must not notice it exists.

## Isolation requirement

`autolith-www` keeps its current definition and dependency list. The editor is a
second ASDF system, `autolith-www/edit`, depending on `autolith-www` and
Hunchentoot. `./script/build` never loads it, and `dist/` never receives editor
code. Every edit-only behavior is conditional on `*edit-mode*`, which is `nil`
everywhere except inside the edit server, so production output is unchanged.

## Layout

```
script/edit            bootstrap, mirroring script/build
script/edit.lisp       pushes :hunchentoot-no-ssl, loads the system, starts the server
src/edit/server.lisp   Hunchentoot acceptor bound to 127.0.0.1
src/edit/panel.lisp    the ~edit-panel component for keys with no in-place node
src/edit/markup.lisp   posted fragment to validated inline nodes
src/edit/printer.lisp  plist to .sexp text, header comments preserved
public/edit/editor.js  click to edit, Ctrl-B, Ctrl-I, Ctrl-K, autosave
public/edit/editor.css
```

`site--copy-directory` skips `public/edit/`, so editor assets stay out of `dist/`.

## Serving

`GET /` reloads `content/` and renders `(site-page)` in memory, so a reload always
reflects the files on disk. `GET /<path>` serves `public/`, including `edit/`.
`POST /copy` saves one key. The acceptor binds `127.0.0.1` only.

## Marking editable regions

`content` splits in two. `content-nodes` returns the raw element list and backs
`content-text`. `content` returns those nodes unchanged outside edit mode, and in
edit mode wraps them in `(span :class "edit-field" :data-copy "section:key")`. An
inline span in inline context changes no layout.

In edit mode the page renders `<html data-still="1">`, and `runtime.js` reads that
attribute in addition to the `still` query parameter. The existing still path
already skips `splitAll`, which destroys and rebuilds `innerHTML` on `[data-split]`
headings; without it the hero headline cannot be edited in place.

## Round trip

`editor.js` serializes an edited subtree to sexp text and posts it. The server
reads that text with `*read-eval*` bound to `nil` and validates every node with
the existing `content--validate-node`, so browser input passes through the same
gate as file input. Rejected markup produces a 400 and leaves the file untouched.

Element mapping: `strong`, `em`, `b`, `i`, `code`, `kbd`, `span` map to their
keywords with an empty attribute list; `a` carries `:href`; `br` becomes
`(:br nil)`. Any other element is replaced by its text. Attributes outside
`:href`, `:class` and `:aria-hidden` are dropped.

Existing markup the keys do not produce, such as `:code` and `:kbd`, survives a
round trip unchanged. `contenteditable` normalizes whitespace, so hand-written
leading and trailing spaces inside a copy string collapse on first save. HTML
collapses them when rendering, so nothing moves on the page.

## Side panel

Keys with no in-place node, such as the page title and the installation commands,
appear in a collapsible panel of plain fields. Membership is derived rather than
listed: edit mode renders the page once to record which keys `content` served,
then renders again with the panel built from the remaining keys. Page generation
takes about 15 ms, so the second pass is free.

## Saving

Fields save on blur, and Ctrl-S flushes everything dirty. A status line reports
the saved key or the validation failure. The server re-reads the target file,
replaces the one key, writes, and reloads `*content*`.

`content-write` copies the file's leading `;;` comment lines verbatim, then prints
the plist deterministically: one key per line, its value list on the following
line, `nil` for empty attribute lists, `"` and `\` escaped in strings. The same
plist always produces the same bytes.

Git is the undo mechanism. The editor has no revert, no history and no conflict
detection; it is a single-user local tool.

## Vendored dependencies

Hunchentoot 1.3.1 and its transitive dependencies are added to `vendor/` with pins
and licenses recorded in `vendor/README.md`. Pushing `:hunchentoot-no-ssl` removes
the cl+ssl and cffi subtree. `.vercelignore` excludes the editor-only libraries so
they do not inflate the deployment upload.

## Checks

No new automated checks, by decision. `./script/check` must continue to pass
unchanged, proving the static build and its tests are unaffected. The round trip
is verified by hand against a real edit before the work is considered done.
