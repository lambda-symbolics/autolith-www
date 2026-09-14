(in-package #:autolith-www)

(defcomp ~section-state nil
  "Render the state section."
  (hsx
    (section :class "band" :id "state"
      (div :class "wrap wrap--wide"
        (div :class "lede-block"
          (h2 :class "display d2" :data-split t
            (content ':state ':title))
          (p :class "lede" :data-rv t
            (content ':state ':lede)))
        (div :class "bento" :data-rv t
          (article :class "cell cell--6 cell--solid"
            (h3 :class "display"
              (content ':state ':subtitle))
            (p
              (content ':state ':paragraph)))
          (article :class "cell cell--3"
            (h3 :class "display"
              (content ':state ':subtitle-2))
            (p
              (content ':state ':paragraph-2)))
          (article :class "cell cell--3"
            (h3 :class "display"
              (content ':state ':subtitle-3))
            (p
              (content ':state ':paragraph-3)))
          (article :class "cell cell--3"
            (h3 :class "display"
              (content ':state ':subtitle-4))
            (p
              (content ':state ':paragraph-4)))
          (article :class "cell cell--3"
            (h3 :class "display"
              (content ':state ':subtitle-5))
            (p
              (content ':state ':paragraph-5)))
          (article :class "cell cell--3"
            (h3 :class "display"
              (content ':state ':subtitle-6))
            (p
              (content ':state ':paragraph-6)))
          (article :class "cell cell--3"
            (h3 :class "display"
              (content ':state ':subtitle-7))
            (p
              (content ':state ':paragraph-7))))
        (p :class "bento__foot" :data-rv t
          (content ':state ':bento__foot))))))
