# Repository Guidelines

## Purpose and Sources of Truth

Generate the Autolith website as static HTML with Common Lisp and HSX.
README.md documents editing, building, checking and deployment. Tracked source
and behavioral tests are executable truth. Keep the project small and readable.

- Keep copy in content/, HSX components in src/, and browser assets in public/.
- Generate dist/; do not check generated pages or build caches into Git.
- Use Common Lisp, ASDF and UIOP for generation and data processing.
- Use plain ES modules for browser behavior. Add dependencies only for a concrete need.
- Keep content readable without JavaScript and preserve keyboard access.
- Animate by default regardless of system motion preferences. Keep explicit pause controls.
- Preserve the ink, paper, green and one-bit visual design.
- Keep credentials and deployment state out of source and Git.
- Do not leave TODOs, FIXMEs, stubs or partial implementations.
- Operate on Lisp forms for durable Lisp source edits, not blind regex replacement.

## Upstream References

Pin vendored dependencies and retain their licenses. Record repository URLs,
versions and inspected commits in vendor/README.md. Keep upstream checkouts
outside this repository and read-only. Refresh before claiming current behavior.

## Package Policy

Use one project package, #:autolith-www. Define it once in src/package.lisp.
Use only #:cl; import individual third-party symbols. Express boundaries with
files, functions and components rather than additional project packages.
Vendored upstream packages retain their original organization.

## Code Organization

- Keep boot files limited to startup, shutdown, configuration, and component
  wiring. Put substantive behavior in focused implementation files.
- Split code by coherent responsibility. Do not create `misc`, `helpers`, or
  a growing multi-purpose `util` dumping ground.
- Keep utility files single-purpose.
- Preserve public entry points when splitting code, and move one coherent
  concern at a time.
- Group definitions by functionality, not alphabetically.
- Within a file, prefer this order where applicable: types and classes,
  generic functions, methods, public functions, private functions, and
  conditions.

Prefer simple, established, readable solutions. Keep business logic above
low-level mechanics. Prefer small, documented functions even when a helper is
used only once. Use CLOS when it provides a useful semantic protocol instead
of repeating type or state dispatch in `cond` trees.

## Common Lisp Style

### Naming

- Use kebab-case symbols without abbreviations.
- Do not use `defconstant` or `define-constant`.
- Use `defparameter` for reloadable policy and defaults.
- Use `defvar` only for state or identity intended to survive reload.
- Special variables use surrounding asterisks, for example `*active-image*`.
- Functions use clear, entity-prefixed names where an entity exists, for
  example `generation-find` and `conversation-append-record`.
- Internal functions use a double hyphen after the entity or subsystem name,
  for example `generation--validate-manifest`.
- Predicates use a `-p` suffix.
- Conversion functions use `->`, for example `record->message`.
- Classes are singular lowercase names. Accessors are prefixed with the
  entity name.
- Functions and methods with four or more parameters use keyword arguments.
  Do not introduce new positional lambda lists with four or more parameters.
- Prefer `first` and `rest` over `car` and `cdr` in application code.
- Quote keywords used as data. Whenever a keyword value directly follows a
  keyword-argument name, in a call, an evaluated plist, or a `defclass`
  `:initform`, quote the value, for example `:status ':durable`. Never quote
  keywords in unevaluated syntax positions: `defclass` `:initarg` names,
  `case` clause keys, `member` type specifiers, quoted configuration data,
  and macro metadata the macro quotes itself.

### Types and Documentation

- Use native Common Lisp type declarations where they clarify a contract.
- Keep reusable custom types in one coherent location.
- Do not define weak aliases that merely expand to `list` or another generic
  type. Validate structured types with `(satisfies predicate)` or a stronger
  type expression.
- Give functions and macros documentation strings. Give classes, slots,
  generic functions, and conditions documentation in their supported
  documentation locations.
- Use this comment hierarchy:

  ```lisp
  ;;;; -- Major Section --
  ;;; Minor section
  ;; Regular comment
  ; Inline comment, rarely
  ```

### Formatting

Use two-space indentation and vertical alignment where related forms expose a
repeated structure. In particular, align class slot options, `let` bindings,
and keyword arguments in multi-line calls.

```lisp
(let* ((manifest-path (generation-manifest-path generation))
       (core-path     (generation-core-path generation))
       (commit        (generation-commit generation)))
  (generation-validate :manifest-path manifest-path
                       :core-path     core-path
                       :commit        commit))
```

- Put one blank line between definitions and two blank lines between major
  sections.
- Leave no trailing whitespace.
- Put a conditional clause body on the line after its test, even for `nil`.
- In `labels`, leave a blank line between local function definitions.
- A literal percent sign in a `format` control string is `%`, not `%%`.
  Common Lisp `format` directives begin with `~`.

### Conditions, Restarts, and Returns

- Define domain-specific conditions with structured data, documentation, and
  helpful report functions. Do not use raw error strings where callers need
  to distinguish or recover from failures.
- Use `handler-case` for expected failures and establish useful restarts where
  practical.
- Keep the condition and restart model explicit at component boundaries,
  especially in mutation, provider, checkpoint, and recovery code.
- Guard LLM-assisted condition handling against recursion. A serious failure
  while that path is already handling a condition is fatal.
- Use `(block nil ... (return ...))` for clear early returns.
- Boolean functions return exactly `t` or `nil`.
- Use explicit `values` forms for intentional multiple-value returns and
  document those values.

### Macros and Dependencies

- Prefer functions to macros when functions suffice.
- Name context and resource macros with a `with-` prefix.
- Prevent variable capture with gensyms or deliberate block names, and
  document expansion and evaluation behavior.
- Anaphoric forms may be used when they materially improve readability. Do
  not add an anaphora dependency without asking if the project does not
  already use one.

## Quality and Testing

Test behavior, validation, escaping, deterministic generation, asset references,
keyboard controls, mobile layouts and reduced-motion and no-JavaScript modes.
Avoid checks that merely pin wording or incidental source shape. Implement the
failure paths and report environmental failures precisely.

Run every repository check, including after documentation changes:

```sh
npm ci
npx playwright install chromium
./script/check
```

For a system Chromium, set CHROMIUM=/path/to/chromium instead of installing the
Playwright browser. Build alone with ./script/build. Test the downloadable Linux
x86-64 runtime with SITE_DOWNLOAD_SBCL=1 ./script/build. The shell bootstrap is
limited to acquiring and starting Lisp; generation belongs in Lisp.

## Commit Policy

- Imperative title only, shorter than 72 characters, without attribution trailers.
- Keep changes coherent and independently reviewable; do not mix unrelated work.
- Run checks before committing. Inspect the worktree and stage intended files only.
- Push after each commit. Rebase instead of merging; do not rewrite user work.
- Never post GitHub comments.

Never use em dashes in source comments, documentation, commits or user-facing text.
