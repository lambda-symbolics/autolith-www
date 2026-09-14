(in-package #:autolith-www)

(defcomp ~section-repl nil
  "Render the repl section."
  (hsx
    (section :class "band band--flush" :id "repl"
      (div :class "scrub" :id "sugarScrub" :style "height:250svh"
        (div :class "scrub__sticky"
          (div :class "wrap wrap--wide sugar"
            (h2 :class "display d2" :data-split t
              (content ':repl ':title))
            (div :class "sugar__stage"
              (span :class "sugar__glyphs" :id "sugar" :aria-hidden "true")
              (span :class "sr"
               "The sentence \"Hello Autolith! How do you do?\" is read as the Lisp form (prompt :to 'autolith \"Hello Autolith! How do you do?\")"))
            (p :class "sugar__caption" :id "sugarCaption"
              (content ':repl ':sugarcaption)))))
      (div :class "wrap wrap--wide repl__after"
        (div :class "tryit" :data-rv t
          (h3 :class "display d3"
            (content ':repl ':subtitle))
          (p :class "prose tryit__intro"
            (content ':repl ':prose))
          (div :class "tryit__box win shadowband"
            (p :class "win__bar"
              (content ':repl ':win__bar))
            (label :class "tryit__in"
              (span :class "tryit__caret" :aria-hidden "true" "❯")
              (span :class "sr" "Type a message or a Lisp form")
              (input :id "replInput" :type "text" :spellcheck "false"
               :autocomplete "off" :placeholder
               "Summarize the failing tests and propose the smallest fix."))
            (output :class "tryit__out" :id "replOut" :aria-live "polite"))
          (p :class "tryit__note" :id "replNote"
            (content ':repl ':replnote))
          (p :class "prose tryit__foot"
            (content ':repl ':prose-2)))
        (div :class "two"
          (div :class "stack-3" :data-rv t
            (h3 :class "display d3"
              (content ':repl ':subtitle-2))
            (p :class "prose"
              (content ':repl ':prose-3))
            (figure :class "code"
              (pre :tabindex "0"
                (span :class "cm" ";; a computed prompt")
                "
("
                (span :class "kw" "prompt")
                " ("
                (span :class "kw" "read-file")
                " \"review-notes.org\"))

"
                (span :class "cm" ";; a tool, called by hand")
                "
("
                (span :class "kw" "resource.read")
                " :uri \"workspace:.\")

"
                (span :class "cm" ";; introspection, right there")
                "
("
                (span :class "kw" "describe")
                " 'application)")))
          (div :class "stack-3" :data-rv t :style "--d:1"
            (h3 :class "display d3"
              (content ':repl ':subtitle-3))
            (p :class "prose"
              (content ':repl ':prose-4))
            (figure :class "code"
              (pre :tabindex "0"
                "("
                (span :class "kw" "prompt")
                " :to 'test-review
        \"Run the focused tests and
         report only failures.\")"))))))))
