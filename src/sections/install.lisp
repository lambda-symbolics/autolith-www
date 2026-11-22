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
            (div :class "panel" :role "tabpanel" :data-tabpanel "windows" :hidden t
              (~install-command :method ':windows)
              (p :class "prose panel__note"
                (content ':install ':prose-3))))
          (div :class "stack-2 install__auth"
            (p :class "code__cap"
              (content ':install ':code__cap))
            (~shell-commands
              :commands (loop for provider in '("anthropic" "chatgpt" "copilot"
                                                "fireworks" "gemini" "grok"
                                                "mistral" "nous" "opencode"
                                                "openrouter")
                              collect (format nil "autolith auth ~a" provider)))
            (p :class "prose panel__note"
              (content ':install ':prose-4))))))))
