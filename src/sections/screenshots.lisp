(in-package #:autolith-www)

(defcomp ~section-screenshots nil
  "Render a screenshot gallery with keyboard controls."
  (let ((screenshots '(("autolith-boot" "Autolith Lisp Machine startup screen")
                       ("autolith-session" "Autolith session showing tool calls, an active plan, and the channel sidebar")
                       ("autolith-channels" "Autolith welcome screen beside a list of channels"))))
    (hsx
      (section :class "band band--short" :id "screenshots" :aria-labelledby "screenshots-title"
        (div :class "wrap"
          (div :class "win shadowband screenshots tabgroup" :data-rv "fade"
            (h2 :class "win__bar" :id "screenshots-title" "Screenshots")
            (div :class "screenshots__slides"
              (loop for (name description) in screenshots
                    for path = (format nil "screenshots/~a.webp" name)
                    collect (hsx
                              (div :class "screenshots__slide" :data-tabpanel name
                                (a :href path
                                  (img :src path :alt description :width "2560" :height "1600"
                                       :loading "lazy" :decoding "async"))))))
            (div :class "tabs screenshots__tabs" :role "tablist" :aria-label "Choose a screenshot"
              (loop for (name) in screenshots
                    for index from 1
                    collect (hsx
                              (button :type "button" :role "tab" :data-tab name
                                      :aria-label (format nil "Screenshot ~d" index)
                                (format nil "~2,'0d" index)))))))))))
