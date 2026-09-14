(in-package #:autolith-www)

(defcomp ~section-image nil
  "Render the image section."
  (hsx
    (section :class "band" :id "image"
      (canvas :class "marg marg--r" :data-plate "orb" :style "--mt:30%"
       :data-rv "fade" :aria-hidden "true")
      (div :class "wrap wrap--wide"
        (div :class "two two--wide"
          (div :class "stack-3"
            (h2 :class "display d2" :data-split t
              (content ':image ':title))
            (p :class "prose" :data-rv t
              (content ':image ':prose))
            (p :class "prose" :data-rv t :style "--d:1"
              (content ':image ':prose-2))
            (p :class "prose" :data-rv t :style "--d:2"
              (content ':image ':prose-3)))
          (figure :class "win shadowband" :id "imagebox" :data-rv "fade"
            (figcaption :class "win__bar"
              (content ':image ':caption))
            (div :class "win__body imagebox__grid"
              (i
                "provider"
                (br)
                "client")
              (i
                "terminal"
                (br)
                "interface")
              (i
                "tool"
                (br)
                "registry")
              (i
                "MCP"
                (br)
                "connections")
              (i
                "conversation"
                (br)
                "store")
              (i
                "persistent"
                (br)
                "memories")
              (i
                "workspace"
                (br)
                "agenda")
              (i
                "mutation"
                (br)
                "journal")
              (i
                "what happens"
                (br)
                "next"))))
        (div :class "clusters" :data-rv t
          (div :class "cluster"
            (h3 :class "cluster__t"
              (content ':image ':subtitle))
            (dl
              (div
                (dt "Repository work")
                (dd
                  (content ':image ':paragraph)))
              (div
                (dt "Unattended jobs")
                (dd
                  (content ':image ':paragraph-2)))))
          (div :class "cluster"
            (h3 :class "cluster__t"
              (content ':image ':subtitle-2))
            (dl
              (div
                (dt "Live Lisp")
                (dd
                  (content ':image ':paragraph-3)))
              (div
                (dt "Oversized context")
                (dd
                  (content ':image ':paragraph-4)))
              (div
                (dt "Continuity")
                (dd
                  (content ':image ':paragraph-5))))))))))
