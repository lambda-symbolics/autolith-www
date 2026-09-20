(in-package #:autolith-www)

(defparameter *edit-panel* nil
  "A function rendering the editing panel, installed by the editing server.")

(defun site-page ()
  "Compose the landing page from HSX components and editable copy."
  (let ((title (content-text ':site ':title))
        (description (content-text ':site ':description))
        (url (content-text ':site ':url)))
    (hsx
      (html :lang "en" :data-still (when *edit-mode* "1")
        (head
          (meta :charset "UTF-8")
          (meta :name "viewport" :content "width=device-width, initial-scale=1, viewport-fit=cover")
          (title title)
          (meta :name "description" :content description)
          (meta :name "theme-color" :content "#fffefa")
          (link :rel "canonical" :href url)
          (link :rel "icon" :href "logo/favicon.svg" :type "image/svg+xml")
          (meta :property "og:title" :content title)
          (meta :property "og:description" :content description)
          (meta :property "og:type" :content "website")
          (meta :property "og:url" :content url)
          (meta :property "og:image" :content (concatenate 'string url "/og.png"))
          (meta :name "twitter:card" :content "summary_large_image")
          (link :rel "preload" :href "fonts/cmu-typewriter-regular.woff2"
                :as "font" :type "font/woff2" :crossorigin t)
          (link :rel "preload" :href "fonts/times-new-roman-regular.woff2"
                :as "font" :type "font/woff2" :crossorigin t)
          (link :rel "stylesheet" :href "css/site.css")
          (link :rel "stylesheet" :href "asciinema-player.css")
          (when *edit-mode*
            (hsx (link :rel "stylesheet" :href "edit/editor.css")))
          (script :type "module" :src "js/main.js")
          (when *edit-mode*
            (hsx (script :type "module" :src "edit/editor.js"))))
        (body
          (a :class "skip" :href "#main" "Skip to content")
          (~navigation)
          (main :id "main"
            (span :id "top")
            (~section-hero)
            (~section-image)
            (~section-repl)
            (~section-mutation)
            (~plate :kind "mobius")
            (~section-context)
            (~plate :kind "corpus")
            (~section-sessions)
            (~section-live)
            (~plate :kind "moire")
            (~section-security)
            (~section-state)
            (~section-yours)
            (~plate :kind "layers")
            (~section-install))
          (div :class "swell" :aria-hidden "true" (canvas :id "swell"))
          (~section-footer)
          (when *edit-panel*
            (funcall *edit-panel*)))))))
