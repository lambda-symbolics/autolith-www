(in-package #:autolith-www)

(defcomp ~section-sessions nil
  "Render the sessions section."
  (hsx
    (section :class "band" :id "sessions"
      (div :class "wrap wrap--wide"
        (div :class "lede-block"
          (h2 :class "display d2" :data-split t
            (content ':sessions ':title)))
        (div :class "demos tabgroup" :data-rv t
          (div :class "tabs demos__tabs" :role "tablist" :aria-label "Recorded sessions"
            (button :role "tab" :aria-selected "true" :data-tab "d-oversized"
             "Answer over 3.1 MB")
            (button :role "tab" :aria-selected "false" :data-tab "d-mutation"
             "Break and recover")
            (button :role "tab" :aria-selected "false" :data-tab "d-continuity"
             "Persist and resume"))
          (div :class "demo" :role "tabpanel" :data-tabpanel "d-oversized"
            (div :class "player" :data-cast "casts/oversized-context.cast" :data-cols "120" :data-rows "34"
              (div :class "player__poster"
                (pre :tabindex "0" "  :::.      :::        AUTOLITH v0.35.0
  ;;`;;     ;;;        ─────────────────────────────────
 ,[[ '[[,   [[[        model      gpt-5.6-terra
c$$$cc$$$c  $$'        workspace  /root/common-lisp/frob/
 888   888,o88oo,.__
 YMM   \"\"` \"\"\"\"YUMMM")
                (button :class "player__load" "Play the recording, 4 min 36 s")
                (a :class "recording-download" :href
                 "casts/oversized-context.cast" "Download recording")))
            (dl :class "sheet demo__meta"
              (div
                (dt "Asked")
                (dd
                  (content ':sessions ':paragraph)))
              (div
                (dt "Cost")
                (dd
                  (content ':sessions ':paragraph-2)))
              (div
                (dt "Answer")
                (dd
                  (content ':sessions ':paragraph-3)))))
          (div :class "demo" :role "tabpanel" :data-tabpanel "d-mutation" :hidden t
            (div :class "player" :data-cast "casts/live-mutation.cast" :data-cols "120" :data-rows "34"
              (div :class "player__poster"
                (pre :tabindex "0" "  :::.      :::        AUTOLITH v0.35.0
  ;;`;;     ;;;        ─────────────────────────────────
 ,[[ '[[,   [[[        model      gpt-5.6-terra
c$$$cc$$$c  $$'        workspace  /root/common-lisp/frob/
 888   888,o88oo,.__
 YMM   \"\"` \"\"\"\"YUMMM")
                (button :class "player__load" "Play the recording, 6 min 19 s")
                (a :class "recording-download" :href "casts/live-mutation.cast"
                 "Download recording")))
            (dl :class "sheet demo__meta"
              (div
                (dt "Asked")
                (dd
                  (content ':sessions ':paragraph-4)))
              (div
                (dt "What happened")
                (dd
                  (content ':sessions ':paragraph-5)))
              (div
                (dt "Cost")
                (dd
                  (content ':sessions ':paragraph-6)))))
          (div :class "demo" :role "tabpanel" :data-tabpanel "d-continuity" :hidden t
            (div :class "player" :data-cast "casts/continuity.cast" :data-cols "120" :data-rows "34"
              (div :class "player__poster"
                (pre :tabindex "0"
                 "root@lho-thinkpad: ~/common-lisp/frob # ./bin/autolith
  :::.      :::        AUTOLITH v0.35.0
  ;;`;;     ;;;        ─────────────────────────────────
 ,[[ '[[,   [[[        model      gpt-5.6-terra
c$$$cc$$$c  $$'        workspace  /root/common-lisp/frob/
 888   888,o88oo,.__")
                (button :class "player__load" "Play the recording, 10 min 11 s")
                (a :class "recording-download" :href "casts/continuity.cast"
                 "Download recording")))
            (dl :class "sheet demo__meta"
              (div
                (dt "Asked")
                (dd
                  (content ':sessions ':paragraph-7)))
              (div
                (dt "Result")
                (dd
                  (content ':sessions ':paragraph-8)))
              (div
                (dt "Cost")
                (dd
                  (content ':sessions ':paragraph-9))))))))))
