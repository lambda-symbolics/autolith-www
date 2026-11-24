(in-package #:autolith-www)

(defcomp ~section-screenshots nil
  "Render a screenshot gallery with keyboard controls."
  (let ((screenshots '(("autolith-boot" "Autolith Lisp Machine startup screen")
                       ("autolith-session" "Autolith session showing tool calls, an active plan, and the channel sidebar")
                       ("autolith-channels" "Autolith welcome screen beside a list of channels"))))
    (hsx
      (section :class "band screenshots" :id "screenshots" :aria-labelledby "screenshots-title"
        (div :class "wrap" :data-rv "fade"
          (h2 :class "display d2" :id "screenshots-title" "Screenshots")
          (div :class "screenshots__slides" :id "screenshot-slides"
            (loop for (name description) in screenshots
                  for path = (format nil "screenshots/~a.webp" name)
                  collect (hsx
                            (a :class "screenshots__slide" :href path
                              (img :src path :alt description :width "2560" :height "1600"
                                   :loading "lazy" :decoding "async")))))
          (div :class "screenshots__pager" :role "group" :aria-label "Screenshot controls" :hidden t
            (button :type "button" :aria-label "Previous screenshot" :aria-controls "screenshot-slides" "<")
            (span :role "status"
              (format nil "01 / ~2,'0d" (length screenshots)))
            (button :type "button" :aria-label "Next screenshot" :aria-controls "screenshot-slides" ">")))))))
