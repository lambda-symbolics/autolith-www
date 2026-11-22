(in-package #:autolith-www)

(defcomp ~section-tasks nil
  "Render persistent multi-agent channels and an engineering delegation example."
  (hsx
    (section :class "band" :id "tasks"
      (canvas :class "marg marg--l marg--tall" :data-plate "branches" :style
       "--mt:24%" :data-rv "fade" :aria-hidden "true")
      (div :class "wrap wrap--wide"
        (div :class "lede-block"
          (h2 :class "display d2" :data-split t
            (content ':tasks ':title))
          (p :class "lede" :data-rv t
            (content ':tasks ':lede)))
        (div :class "figpair"
          (figure :class "figure" :data-rv "fade"
            (div :class "fig" :id "taskFig"))
          (div :class "stack-3"
            (p :class "prose"
              (content ':tasks ':prose))
            (p :class "prose"
              (content ':tasks ':prose-2))))
        (dl :class "deflist deflist--two tasks__list" :data-rv t
          (div
            (dt "Inspect and steer")
            (dd (content ':tasks ':inventory)))
          (div
            (dt "Models and roles")
            (dd (content ':tasks ':roles)))
          (div
            (dt "Councils and hierarchies")
            (dd (content ':tasks ':peers)))
          (div
            (dt "Keep the context")
            (dd (content ':tasks ':continuity))))))))
