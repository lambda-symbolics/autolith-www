(in-package #:autolith-www)

(defcomp ~section-security nil
  "Render the security section."
  (hsx
    (section :class "band" :id "security"
      (canvas :class "marg marg--l" :data-plate "pulse" :style "--mt:24%"
       :data-rv "fade" :aria-hidden "true")
      (div :class "wrap wrap--wide"
        (div :class "lede-block"
          (h2 :class "display d2" :data-split t
            (content ':security ':title))
          (p :class "lede" :data-rv t
            (content ':security ':lede)))
        (dl :class "deflist" :data-rv t
          (div
            (dt "Sandbox")
            (dd
              (content ':security ':paragraph)))
          (div
            (dt "Classification")
            (dd
              (content ':security ':paragraph-2)))
          (div
            (dt "Approvals")
            (dd
              (content ':security ':paragraph-3)))
          (div
            (dt "Credentials")
            (dd
              (content ':security ':paragraph-4)))
          (div
            (dt "Bounds")
            (dd
              (content ':security ':paragraph-5)))
          (div
            (dt "Revision gating")
            (dd
              (content ':security ':paragraph-6)))
          (div
            (dt "Immutable mode")
            (dd
              (content ':security ':paragraph-7))))))))
