(in-package #:autolith-www)

(defcomp ~section-context nil
  "Render the context section."
  (hsx
    (section :class "band" :id "context"
      (div :class "wrap wrap--wide"
        (div :class "two two--viz"
          (figure :class "figure"
            (div :class "rlm__viz" :id "rlmViz" :aria-hidden "true")
            (figcaption
              (content ':context ':caption)))
          (div :class "stack-3"
            (h2 :class "display d2" :data-split t
              (content ':context ':title))
            (p :class "prose"
              (content ':context ':prose))
            (p :class "prose"
              (content ':context ':prose-2))))))))
