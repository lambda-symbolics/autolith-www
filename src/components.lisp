(in-package #:autolith-www)

(defparameter *navigation*
  '(("image" "Live image") ("repl" "The REPL")
    ("mutation" "Self-modification") ("context" "RLM")
    ("security" "Security") ("sessions" "Sessions")
    ("state" "State") ("yours" "Yours"))
  "Section links in the bar. The install call to action is rendered separately.")

(defun site-inline-svg (relative-path)
  "Read an SVG asset for inlining, without its embedded stylesheet.

Inlining lets the mark inherit the bar's colour. The asset's own <style> is
dropped so its rules stay out of the document, and site.css carries them."
  (let* ((source (uiop:read-file-string
                  (merge-pathnames (concatenate 'string "public/" relative-path)
                                   *site-root*)))
         (start (search "<style>" source))
         (end (search "</style>" source)))
    (string-trim '(#\Newline #\Space)
                 (if (and start end (< start end))
                     (concatenate 'string (subseq source 0 start)
                                  (subseq source (+ end (length "</style>"))))
                     source))))

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
        (hsx (a :href (concatenate 'string "#" id) (span label)))))))

(defcomp ~navigation ()
  "Render the fixed bar: the mark, the section links and the install link.

Below the width where the section links stop fitting they are hidden, and the
bar keeps the mark and the call to action."
  (hsx
    (header :class "nav" :id "nav"
      (div :class "wrap wrap--wide nav__in"
        (a :class "brand" :href "#top" :aria-label "Lambda Symbolics, back to top"
          (raw! (site-inline-svg "logo/ls-lambda.svg")))
        (nav :class "nav__links" :id "navLinks" :aria-label "Sections"
          (~navigation-links))
        (a :class "nav__cta" :href "#install" (span "Install"))))))

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
