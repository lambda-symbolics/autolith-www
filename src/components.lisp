(in-package #:autolith-www)

(defparameter *navigation*
  '(("image" "Live image") ("repl" "The REPL")
    ("mutation" "Self-modification") ("context" "RLM")
    ("security" "Security") ("sessions" "Sessions")
    ("state" "State") ("yours" "Yours") ("install" "Install"))
  "Section links shared by the desktop and mobile navigation.")

(defun content-text (section key)
  "Read a plain-text copy value for an attribute or command."
  (let ((nodes (content-nodes section key)))
    (unless (every #'stringp nodes)
      (content--fail (list section key) "Expected plain text."))
    (format nil "~{~a~}" nodes)))

(defcomp ~navigation-links ()
  "Render the shared section navigation."
  (hsx
    (<>
      (loop for (id label) in *navigation* collect
        (hsx (a :href (concatenate 'string "#" id)
                :class (when (equal id "install") "nav__cta")
                (span label)))))))

(defcomp ~navigation ()
  "Render both navigation layouts from the same links."
  (hsx
    (<>
      (header :class "nav" :id "nav"
        (div :class "wrap wrap--wide nav__in"
          (a :class "brand" :href "#top" :aria-label "Autolith, back to top"
            (content ':site ':name))
          (nav :class "nav__links" :id "navLinks" :aria-label "Sections"
            (~navigation-links))
          (button :class "nav__burger" :id "burger" :type "button"
                  :aria-label "Open menu" :aria-expanded "false" :aria-controls "menu"
            (i) (i))))
      (div :class "menu" :id "menu" :inert t
        (nav :aria-label "Mobile sections" (~navigation-links))
        (div :class "menu__foot"
          (a :href (content-text ':site ':source) "Source")
          (a :href (content-text ':site ':docs) "Docs")
          (a :href (content-text ':site ':community) "Zulip"))))))

(defcomp ~install-command (&key method)
  "Render a command and its matching clipboard button."
  (let ((command (content-text ':commands method)))
    (hsx
      (div :class "install"
        (code :tabindex "0" command)
        (button :class "install__copy" :type "button" :data-copy command "Copy")))))

(defcomp ~shell-commands (&key commands)
  "Render shell commands with explicit line separators and unselectable prompts."
  (hsx
    (div :class "shellblock" :tabindex "0" :role "region" :aria-label "Code example"
      (loop for command in commands
            for first = t then nil collect
        (hsx
          (<>
            (unless first (string #\Newline))
            (span :class "p" :aria-hidden "true" "$")
            " "
            (b command)))))))

(defcomp ~hero-install ()
  "Render the compact installation selector."
  (hsx
    (div :class "hero__install tabgroup" :data-rv t :style "--d:5"
      (div :class "tabs" :role "tablist" :aria-label "Install Autolith"
        (loop for (method label) in '((:nix "Nix") (:binary "Binary") (:source "Source"))
              for index from 0 collect
          (hsx (button :role "tab" :type "button"
                       :aria-selected (if (zerop index) "true" "false")
                       :data-tab (format nil "h-~(~a~)" method)
                       label))))
      (loop for method in '(:nix :binary :source) for index from 0 collect
        (hsx
          (div :data-tabpanel (format nil "h-~(~a~)" method)
               :hidden (not (zerop index))
            (~install-command :method method)))))))

(defcomp ~plate (&key kind)
  "Render one decorative inter-section figure."
  (hsx
    (div :class "plate" :data-rv "fade" :aria-hidden "true"
      (canvas :class "plate__c" :data-plate kind))))
