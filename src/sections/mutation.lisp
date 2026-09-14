(in-package #:autolith-www)

(defcomp ~section-mutation nil
  "Render the mutation section."
  (hsx
    (section :class "band" :id "mutation"
      (canvas :class "marg marg--l marg--tall" :data-plate "tape" :style
       "--mt:26%" :data-rv "fade" :aria-hidden "true")
      (div :class "wrap wrap--wide"
        (div :class "lede-block"
          (h2 :class "display d2" :data-split t
            (content ':mutation ':title))
          (p :class "lede" :data-rv t
            (content ':mutation ':lede)))
        (div :class "figpair"
          (figure :class "figure" :data-rv "fade"
            (div :class "fig" :id "mutFig")
            (figcaption
              (content ':mutation ':caption)))
          (div :class "stack-3"
            (p :class "prose"
              (content ':mutation ':prose))
            (p :class "prose"
              (content ':mutation ':prose-2))))
        (div :class "figpair figpair--flip"
          (figure :class "figure" :data-rv "fade"
            (div :class "fig" :id "recFig")
            (figcaption
              (content ':mutation ':caption-2)))
          (div :class "stack-3"
            (h3 :class "display d3"
              (content ':mutation ':subtitle))
            (p :class "prose"
              (content ':mutation ':prose-3))
            (p :class "prose"
              (content ':mutation ':prose-4))
            (p :class "note"
              (content ':mutation ':note))))))))
