(in-package #:autolith-www)

(defcomp ~section-tasks nil
  "Render the tasks section: delegation into isolated worktrees and engineering edits."
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
            (div :class "fig" :id "taskFig")
            (figcaption
              (content ':tasks ':caption)))
          (div :class "stack-3"
            (p :class "prose"
              (content ':tasks ':prose))
            (p :class "prose"
              (content ':tasks ':prose-2))))
        (dl :class "deflist deflist--two tasks__list" :data-rv t
          (div
            (dt "/tasks")
            (dd
              (content ':tasks ':inventory)))
          (div
            (dt "Engineering role")
            (dd
              (content ':tasks ':engineering)))
          (div
            (dt "Semantic edits")
            (dd
              (content ':tasks ':semantic)))
          (div
            (dt "Structural rewrites")
            (dd
              (content ':tasks ':structural)))
          (div
            (dt "Peer messages")
            (dd
              (content ':tasks ':peers)))
          (div
            (dt "Debugger")
            (dd
              (content ':tasks ':debugger))))))))
