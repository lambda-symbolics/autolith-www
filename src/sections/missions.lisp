(in-package #:autolith-www)

(defcomp ~mission-budget (&key label fill count shown limit)
  "Render one mission allowance: its spent share, a reservation ahead of it and the count.

FILL is the spent percentage the finished figure shows. COUNT is the number the
animation counts up to, SHOWN its printed form, and LIMIT the allowance."
  (hsx
    (div :class "budget" :data-fill fill :style (format nil "--fill:~a%" fill)
      (span label)
      (span :class "budget__bar"
        (i :class "budget__spent")
        (i :class "budget__res"))
      (span :class "budget__value"
        (b :data-count count shown)
        (format nil " / ~a" limit)))))

(defcomp ~mission-gate (&key name note (attempts "1"))
  "Render one acceptance gate. ATTEMPTS above one fails that many times less one first."
  (hsx
    (li :class "gate" :data-attempts attempts
      (span :class "gate__name" name)
      (span :class "gate__note" note))))

(defcomp ~section-missions nil
  "Render the missions section: verified, budgeted autonomous work."
  (hsx
    (section :class "band" :id "missions"
      (canvas :class "marg marg--r" :data-plate "pulse" :style "--mt:18%"
       :data-rv "fade" :aria-hidden "true")
      (div :class "wrap wrap--wide"
        (div :class "lede-block"
          (h2 :class "display d2" :data-split t
            (content ':missions ':title))
          (p :class "lede" :data-rv t
            (content ':missions ':lede)))
        (div :class "two two--wide"
          (div :class "stack-3"
            (dl :class "sheet"
              (div
                (dt "Criteria")
                (dd
                  (content ':missions ':criteria)))
              (div
                (dt "Gates")
                (dd
                  (content ':missions ':gates)))
              (div
                (dt "Budgets")
                (dd
                  (content ':missions ':budgets)))
              (div
                (dt "Reviews")
                (dd
                  (content ':missions ':reviews)))
              (div
                (dt "Schedules")
                (dd
                  (content ':missions ':schedules)))
              (div
                (dt "Durability")
                (dd
                  (content ':missions ':durability))))
            (p :class "note"
              (content ':missions ':note)))
          (figure :class "win shadowband" :id "missionViz" :data-rv "fade"
            (figcaption :class "win__bar"
              (content ':missions ':win__bar))
            (div :class "win__body mission__body"
              (p :class "mission__objective"
                (content ':missions ':objective))
              (div :class "budgets"
                (~mission-budget :label "turns" :fill "65" :count "26" :shown "26"
                                 :limit "40")
                (~mission-budget :label "tokens" :fill "61.2" :count "61200"
                                 :shown "61,200" :limit "100,000")
                (~mission-budget :label "wall clock" :fill "69" :count "41"
                                 :shown "41" :limit "60 min"))
              (ol :class "gates"
                (~mission-gate :name "build" :note "command")
                (~mission-gate :name "tests" :note "lisp, attempt 2 of 3" :attempts "2")
                (~mission-gate :name "bundle" :note "artifact sha256")
                (~mission-gate :name "review" :note "your evidence"))
              (div :class "mission__foot"
                (p :class "mission__legend"
                  (span (i :class "spent") "spent")
                  (span (i :class "res") "reserved"))
                (p :class "mission__stamp" "verified")))))))))
