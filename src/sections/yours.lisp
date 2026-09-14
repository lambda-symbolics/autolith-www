(in-package #:autolith-www)

(defcomp ~section-yours nil
  "Render the yours section."
  (hsx
    (section :class "band" :id "yours"
      (canvas :class "marg marg--r marg--tall" :data-plate "tape" :style
       "--mt:30%" :data-rv "fade" :aria-hidden "true")
      (div :class "wrap wrap--wide"
        (div :class "lede-block"
          (h2 :class "display d2" :data-split t
            (content ':yours ':title))
          (p :class "lede" :data-rv t
            (content ':yours ':lede)))
        (dl :class "deflist deflist--two" :data-rv t
          (div
            (dt "Skills")
            (dd
              (content ':yours ':paragraph)))
          (div
            (dt "MCP servers")
            (dd
              (content ':yours ':paragraph-2)))
          (div
            (dt "Child roles")
            (dd
              (content ':yours ':paragraph-3)))
          (div
            (dt "Providers")
            (dd
              (content ':yours ':paragraph-4)))
          (div
            (dt "init.lisp")
            (dd
              (content ':yours ':paragraph-5)))
          (div
            (dt "Request context")
            (dd
              (content ':yours ':paragraph-6)))
          (div
            (dt "Commands")
            (dd
              (content ':yours ':paragraph-7)))
          (div
            (dt "Instructions")
            (dd
              (content ':yours ':paragraph-8))))))))
