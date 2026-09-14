(in-package #:autolith-www)

(defcomp ~section-hero nil
  "Render the hero section."
  (hsx
    (section :class "hero"
      (canvas :id "monolith" :aria-hidden "true")
      (div :class "hero__in wrap wrap--wide"
        (div :class "hero__copy"
          (h1 :class "hero__name" :data-rv t
            (content ':hero ':hero__name))
          (p :class "display hero__claim" :data-split t
            (content ':hero ':display))
          (p :class "hero__lede" :data-rv t :style "--d:4"
            (content ':hero ':hero__lede))
          (~hero-install)
          (div :class "hero__acts" :data-rv t :style "--d:6"
            (a :class "btn" :href "https://lambda-symbolics.com/autolith/docs"
              (span "Read the docs"))
            (p :class "hero__plat"
              (content ':hero ':hero__plat))))))))
