(in-package #:autolith-www)

(defcomp ~section-live nil
  "Render the live section."
  (hsx
    (section :class "band" :id "live"
      (canvas :class "marg marg--r" :data-plate "cube" :style "--mt:28%"
       :data-rv "fade" :aria-hidden "true")
      (div :class "wrap wrap--wide"
        (div :class "lede-block"
          (h2 :class "display d2" :data-split t
            (content ':live ':title))
          (p :class "lede" :data-rv t
            (content ':live ':lede)))
        (div :class "two two--wide"
          (div :class "stack-3"
            (figure :class "code" :data-rv t
              (p :class "code__cap"
                (content ':live ':code__cap))
              (pre :tabindex "0"
                (span :class "p" "$")
                " "
                (b "autolith localgroup status")
                "
"
                (span :class "p" "$")
                " "
                (b "autolith localgroup tell")
                "   SESSION \"use the staging config\"
"
                (span :class "p" "$")
                " "
                (b "autolith localgroup attach")
                " SESSION --read-only
"
                (span :class "p" "$")
                " "
                (b "autolith localgroup attach")
                " SESSION --take-over
"
                (span :class "p" "$")
                " "
                (b "autolith localgroup pause")
                "  SESSION
"
                (span :class "p" "$")
                " "
                (b "autolith localgroup kill")
                "   SESSION"))
            (p :class "prose" :data-rv t
              (content ':live ':prose))
            (p :class "note" :data-rv t
              (content ':live ':note)))
          (div :class "stack-3"
            (h3 :class "display d3"
              (content ':live ':subtitle))
            (figure :class "code" :data-rv t
              (pre :tabindex "0"
                (span :class "p" "$")
                " "
                (b "autolith data export")
                " project.sexp --workspace ~/code/project
"
                (span :class "p" "$")
                " "
                (b "autolith data import")
                " project.sexp --workspace ~/src/project"))
            (p :class "prose" :data-rv t
              (content ':live ':prose-2))
            (p :class "note" :data-rv t
              (content ':live ':note-2))
            (ul :class "chips" :data-rv t
              (li "Linux x86_64")
              (li "Linux aarch64")
              (li "musl static")
              (li "macOS x86_64")
              (li "macOS arm64")
              (li "FreeBSD")
              (li "NetBSD")
              (li "OpenBSD")
              (li "Windows x86_64"))))))))
