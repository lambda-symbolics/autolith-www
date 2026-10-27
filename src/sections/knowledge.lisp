(in-package #:autolith-www)

(defcomp ~knowledge-fact (&key predicate subject value earlier basis (class "kb__fact"))
  "Render one fact row. EARLIER is the value the animation starts from, when it changes."
  (hsx
    (li :class class
      (span :class "kb__pred" predicate)
      (span :class "kb__arg" subject)
      (span :class "kb__val" :data-earlier earlier value)
      (span :class "kb__basis" basis))))

(defcomp ~knowledge-turn (&key quarter)
  "Render one remembered turn asking for QUARTER's sales report and the calls it made."
  (hsx
    (li :class "kb__turn"
      (span :class "kb__ask" "Make the sales report for " (b quarter) ".")
      (span :class "kb__calls"
        (span "sales.load") (span "sales.report") (span "notify.send")))))

(defcomp ~knowledge-probe (&key call result rules-out)
  "Render one diagnosis probe: the call, the fact it observed and the hypothesis it ruled out."
  (hsx
    (li :class "kb__probe" :data-rules-out rules-out
      (span :class "kb__call" call)
      (span :class "kb__seen" result)
      (span :class "kb__out" (format nil "rules out ~a" rules-out)))))

(defcomp ~section-knowledge nil
  "Render the knowledge section: evidence-backed facts, rules, procedures and diagnosis."
  (hsx
    (section :class "band" :id "knowledge"
      (canvas :class "marg marg--r" :data-plate "orb" :style "--mt:12%"
       :data-rv "fade" :aria-hidden "true")
      (div :class "wrap wrap--wide"
        (div :class "lede-block"
          (h2 :class "display d2" :data-split t
            (content ':knowledge ':title))
          (p :class "lede" :data-rv t
            (content ':knowledge ':lede)))
        (div :class "two two--wide"
          (div :class "stack-3"
            (figure :class "figure kb-figure" :data-rv "fade"
              (div :class "win shadowband kb" :id "deriveViz"
                (p :class "win__bar"
                  (content ':knowledge ':derive__bar))
                (div :class "win__body kb__body"
                  (ol :class "kb__facts"
                    (~knowledge-fact :predicate "event.start" :subject "review"
                                     :value "14:30" :earlier "13:00" :basis "your statement")
                    (~knowledge-fact :predicate "event.travel" :subject "review"
                                     :value "25 min" :basis "observation")
                    (~knowledge-fact :predicate "event.buffer" :subject "review"
                                     :value "15 min" :basis "your statement"))
                  (p :class "kb__rule"
                    (span "?leave = ?start - (?travel + ?buffer)"))
                  (ol :class "kb__facts"
                    (~knowledge-fact :class "kb__fact kb__derived" :predicate "event.departure"
                                     :subject "review" :value "13:50" :earlier "12:20"
                                     :basis "derived"))
                  (div :class "kb__foot"
                    (p :class "kb__meter" "model requests " (b "0"))
                    (p :class "kb__stamp"
                      (content ':knowledge ':derive__stamp)))))
              (figcaption
                (content ':knowledge ':derive__caption)))
            (p :class "prose"
              (content ':knowledge ':prose)))
          (div :class "stack-3"
            (dl :class "sheet"
              (div
                (dt "Evidence")
                (dd
                  (content ':knowledge ':evidence)))
              (div
                (dt "Rules")
                (dd
                  (content ':knowledge ':rules)))
              (div
                (dt "Contracts")
                (dd
                  (content ':knowledge ':contracts)))
              (div
                (dt "Plans, gates")
                (dd
                  (content ':knowledge ':gates)))
              (div
                (dt "Recipes")
                (dd
                  (content ':knowledge ':recipes)))
              (div
                (dt "(why)")
                (dd
                  (content ':knowledge ':inspect))))))
        (div :class "two kb__pair"
          (div :class "stack-3"
            (figure :class "figure kb-figure" :data-rv "fade"
              (div :class "win shadowband kb" :id "procedureViz"
                (p :class "win__bar"
                  (content ':knowledge ':procedure__bar))
                (div :class "win__body kb__body"
                  (ol :class "kb__turns"
                    (~knowledge-turn :quarter "q2")
                    (~knowledge-turn :quarter "q3")
                    (~knowledge-turn :quarter "q4"))
                  (p :class "kb__notice kb__learned"
                    "@ learned procedure make-sales-report from 3 turns")
                  (p :class "kb__ask kb__next" "Make the sales report for " (b "q5") ".")
                  (p :class "kb__notice kb__fits"
                    "@ learned procedure make-sales-report fits this request")
                  (p :class "kb__run"
                    (span :class "kb__call" "procedure.run make-sales-report {\"file\":\"q5\"}")
                    (span :class "kb__calls"
                      (span "sales.load") (span "sales.report") (span "notify.send")))
                  (div :class "kb__foot"
                    (p :class "kb__meter" "calls chosen by the model " (b "1"))
                    (p :class "kb__stamp"
                      (content ':knowledge ':procedure__stamp)))))
              (figcaption
                (content ':knowledge ':procedure__caption)))
            (p :class "prose"
              (content ':knowledge ':procedure__prose)))
          (div :class "stack-3"
            (figure :class "figure kb-figure" :data-rv "fade"
              (div :class "win shadowband kb" :id "diagnosisViz"
                (p :class "win__bar"
                  (content ':knowledge ':diagnosis__bar))
                (div :class "win__body kb__body"
                  (ul :class "kb__hypotheses"
                    (li :data-hypothesis "unavailable" "unavailable")
                    (li :data-hypothesis "credentials" "credentials")
                    (li :data-hypothesis "stale-endpoint" :class "kb__cause" "stale-endpoint"))
                  (ol :class "kb__probes"
                    (~knowledge-probe :call      "service.ping {\"service\":\"billing\"}"
                                      :result    "service.reachable(billing, true)"
                                      :rules-out "unavailable")
                    (~knowledge-probe :call      "service.config {\"service\":\"billing\"}"
                                      :result    "endpoint.current(billing, false)"
                                      :rules-out "credentials"))
                  (p :class "kb__verdict"
                    "stale-endpoint. Repair: update its endpoint.")
                  (div :class "kb__foot"
                    (p :class "kb__meter" "model requests between probes " (b "0"))
                    (p :class "kb__stamp"
                      (content ':knowledge ':diagnosis__stamp)))))
              (figcaption
                (content ':knowledge ':diagnosis__caption)))
            (p :class "prose"
              (content ':knowledge ':diagnosis__prose))))))))
