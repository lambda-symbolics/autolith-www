# Vendored Lisp dependencies

These are unmodified source snapshots. Keep their copyright notices and licenses.
Builds resolve only this directory and the project, with no Quicklisp downloads.

| Library | Snapshot | Upstream | License |
| --- | --- | --- | --- |
| HSX | 1.2.0, `6af866735cac66c5189de926d8272453180497cb` | https://github.com/skyizwhite/hsx | MIT |
| Alexandria | Quicklisp 2024-10-12 | https://gitlab.common-lisp.net/alexandria/alexandria | Public domain / permissive notice |
| cl-str | Quicklisp 2026-01-01 | https://github.com/vindarel/cl-str | MIT |
| cl-ppcre, cl-ppcre-unicode | Quicklisp 2025-06-22 | https://github.com/edicl/cl-ppcre | BSD-2-Clause |
| cl-unicode | Quicklisp 2024-10-12 | https://github.com/edicl/cl-unicode | BSD-2-Clause |
| cl-change-case | Quicklisp 2025-06-22 | https://github.com/rudolfochrist/cl-change-case | MPL-2.0 |
| flexi-streams | Quicklisp 2024-10-12 | https://github.com/edicl/flexi-streams | BSD-2-Clause |
| trivial-gray-streams | Quicklisp 2024-10-12 | https://github.com/trivial-gray-streams/trivial-gray-streams | MIT |

HSX master at `5345a1524160d9c7d14b4e23557b02dc928addeb` was also inspected
on 2026-09-14. This site pins 1.2.0 because it supplies the component API without
the CSS-minifier dependency introduced in 1.3.0. CSS is maintained separately.
The Quicklisp snapshot directory names identify the vendored releases.
Licenses are in each library's LICENSE/COPYING file or source headers.

The bootstrap in `script/build` pins the official SBCL 2.4.0 Linux x86-64
binary archive from SourceForge and its SHA-256. Its glibc 2.34 requirement
matches Vercel's build host; the SBCL 2.6.8 archive requires glibc 2.38. SBCL
is downloaded into an ignored cache, not included in deployment output.
Review the source URL, checksum and host ABI together when upgrading it.
