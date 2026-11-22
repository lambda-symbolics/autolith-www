(in-package #:autolith-www)

(defcomp ~section-yours nil
  "Render tools, integrations, and optional runtime extensions."
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
            (dt "Tools")
            (dd (content ':yours ':tools)))
          (div
            (dt "Skills")
            (dd (content ':yours ':skills)))
          (div
            (dt "MCP servers")
            (dd (content ':yours ':mcp)))
          (div
            (dt "Editors and ACP")
            (dd (content ':yours ':editors)))
          (div
            (dt "Providers")
            (dd (content ':yours ':providers)))
          (div
            (dt "The live runtime")
            (dd (content ':yours ':runtime))))))))
