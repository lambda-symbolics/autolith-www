(in-package #:autolith-www)

(defcomp ~section-install nil
  "Render the install section."
  (hsx
    (section :class "band" :id "install"
      (div :class "wrap wrap--wide"
        (div :class "two two--install"
          (div :class "stack-3 tabgroup"
            (h2 :class "display d2" :data-split t
              (content ':install ':title))
            (div :class "tabs" :role "tablist" :aria-label "Install methods"
              (button :role "tab" :aria-selected "true" :data-tab "nix"
                "Nix "
                (i "recommended"))
              (button :role "tab" :aria-selected "false" :data-tab "binary"
                "Binary "
                (i "Linux, macOS, BSD"))
              (button :role "tab" :aria-selected "false" :data-tab "source"
                "Source "
                (i "any platform"))
              (button :role "tab" :aria-selected "false" :data-tab "windows"
                "Windows "
                (i "x86_64")))
            (div :class "panel" :role "tabpanel" :data-tabpanel "nix"
              (~shell-commands :commands (list (content-text ':commands ':nix)))
              (p :class "prose panel__note"
                (content ':install ':prose)))
            (div :class "panel" :role "tabpanel" :data-tabpanel "binary" :hidden t
              (~install-command :method ':binary)
              (p :class "prose panel__note"
                (content ':install ':prose-2)))
            (div :class "panel" :role "tabpanel" :data-tabpanel "source" :hidden t
              (~shell-commands
                :commands '("git clone https://github.com/lambda-symbolics/autolith"
                            "cd autolith"
                            "./script/bootstrap"
                            "./script/check"
                            "./bin/autolith")))
            (div :class "panel" :role "tabpanel" :data-tabpanel "windows" :hidden t
              (~install-command :method ':windows)
              (p :class "prose panel__note"
                (content ':install ':prose-3)))
            (div :class "stack-2 install__auth"
              (p :class "code__cap"
                (content ':install ':code__cap))
              (~shell-commands
                :commands (loop for provider in '("anthropic" "chatgpt" "fireworks"
                                                 "gemini" "grok" "mistral" "nous"
                                                 "opencode" "openrouter")
                                collect (format nil "autolith auth ~a" provider)))
              (p :class "prose panel__note"
                (content ':install ':prose-4))))
          (div :class "stack-3"
            (div :class "win shadowband" :data-rv "fade"
              (p :class "win__bar"
                (content ':install ':win__bar))
              (dl :class "win__body sheet"
                (div
                  (dt "Licence")
                  (dd
                    (content ':install ':paragraph)))
                (div
                  (dt "Linux")
                  (dd
                    (content ':install ':paragraph-2)))
                (div
                  (dt "macOS")
                  (dd
                    (content ':install ':paragraph-3)))
                (div
                  (dt "BSD")
                  (dd
                    (content ':install ':paragraph-4)))
                (div
                  (dt "Windows")
                  (dd
                    (content ':install ':paragraph-5)))
                (div
                  (dt "Updates")
                  (dd
                    (content ':install ':paragraph-6)))))
            (p :class "warn"
              (content ':install ':warn))))))))
