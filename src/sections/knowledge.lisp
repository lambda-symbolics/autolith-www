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
  "Render a remembered request for a quarterly sales report."
  (hsx
    (li :class "kb__turn kb__ask"
      "Make the sales report for " (b quarter) ".")))

(defcomp ~knowledge-probe (&key call result rules-out)
  "Render one diagnosis probe: the call, the fact it observed and the hypothesis it ruled out."
  (hsx
    (li :class "kb__probe" :data-rules-out rules-out
      (span :class "kb__call" call)
      (span :class "kb__seen" result)
      (span :class "kb__out" (format nil "rules out ~a" rules-out)))))

(defcomp ~knowledge-derivation nil
  "Show how a change to a premise changes the derived fact."
  (hsx
    (figure :class "win shadowband kb" :id "deriveViz"
      (p :class "win__bar" (content ':knowledge ':derive__bar))
      (div :class "win__body kb__body"
        (ol :class "kb__facts"
          (~knowledge-fact :predicate "event.start" :subject "review"
                           :value "14:30" :earlier "13:00" :basis "your statement")
          (~knowledge-fact :predicate "event.travel" :subject "review"
                           :value "25 min" :basis "observation")
          (~knowledge-fact :predicate "event.buffer" :subject "review"
                           :value "15 min" :basis "your statement"))
        (p :class "kb__rule" (span "?leave = ?start - (?travel + ?buffer)"))
        (ol :class "kb__facts"
          (~knowledge-fact :class "kb__fact kb__derived" :predicate "event.departure"
                           :subject "review" :value "13:50" :earlier "12:20" :basis "derived"))
        (div :class "kb__foot"
          (p :class "kb__meter" "model requests " (b "0"))
          (~status-badge :class "kb__stamp" :label (content ':knowledge ':derive__stamp)))))))

(defcomp ~knowledge-diagnosis nil
  "Show a set of probes narrowing down a billing service failure."
  (hsx
    (figure :class "win shadowband kb" :id "diagnosisViz"
      (p :class "win__bar" (content ':knowledge ':diagnosis__bar))
      (div :class "win__body kb__body"
        (ul :class "kb__hypotheses"
          (li :data-hypothesis "unavailable" "unavailable")
          (li :data-hypothesis "credentials" "credentials")
          (li :data-hypothesis "stale-endpoint" :class "kb__cause" "stale-endpoint"))
        (ol :class "kb__probes"
          (~knowledge-probe :call      "service.ping {\"service\":\"billing\"}"
                            :result    "service.reachable(billing, true)"
                            :rules-out "unavailable")
          (~knowledge-probe :call      "service.auth {\"service\":\"billing\"}"
                            :result    "credentials.valid(billing, true)"
                            :rules-out "credentials"))
        (p :class "kb__verdict" "Of the three hypotheses, only the stale endpoint fits.")
        (div :class "kb__foot"
          (p :class "kb__meter" "model requests between probes " (b "0"))
          (~status-badge :class "kb__stamp" :label (content ':knowledge ':diagnosis__stamp)))))))

(defcomp ~knowledge-procedure nil
  "Show repeated service calls becoming a single parameterized procedure."
  (hsx
    (figure :class "win shadowband kb" :id "procedureViz"
      (p :class "win__bar" (content ':knowledge ':procedure__bar))
      (div :class "win__body kb__body"
        (ol :class "kb__turns"
          (~knowledge-turn :quarter "q1")
          (~knowledge-turn :quarter "q2")
          (~knowledge-turn :quarter "q3"))
        (p :class "kb__run"
          (span :class "kb__ask" "Make the sales report for " (b "q4") ".")
          (span :class "kb__call" "procedure.run make-sales-report {\"file\":\"q4\"}")
          (span :class "kb__calls"
            (span "sales.load") (span "sales.report") (span "notify.send")))
        (div :class "kb__foot"
          (p :class "kb__meter" "calls chosen by the model " (b "1"))
          (~status-badge :class "kb__stamp" :label (content ':knowledge ':procedure__stamp)))))))

(defcomp ~knowledge-checkpoint nil
  "Show a compaction note, its fact reference and a later change to the cited fact."
  (hsx
    (figure :class "win shadowband kb"
      (p :class "win__bar" (content ':knowledge ':compaction__bar))
      (dl :class "win__body kb__body kb__checkpoint"
        (div
          (dt "Decision at compaction")
          (dd (content ':knowledge ':compaction__decision)))
        (div
          (dt "Cited fact")
          (dd (code (content ':knowledge ':compaction__evidence))))
        (div
          (dt "Change on the next turn")
          (dd (content ':knowledge ':compaction__notice)))))))

(defcomp ~knowledge-slide (&key name title prose extra example)
  "Render one example and its explanation; tabs show one slide at a time."
  (hsx
    (div :class "kb__slide" :data-tabpanel name :tabindex "0"
      (div :class "two two--wide"
        (div :class "stack-3 kb__intro"
          (h3 :class "display d3" (content ':knowledge title))
          (p :class "prose" (content ':knowledge prose))
          extra)
        example))))

(defcomp ~section-knowledge nil
  "Render the four examples in a reader-controlled carousel."
  (hsx
    (section :class "band" :id "knowledge"
      (canvas :class "marg marg--r" :data-plate "orb" :style "--mt:12%"
       :data-rv "fade" :aria-hidden "true")
      (div :class "wrap wrap--wide"
        (div :class "lede-block"
          (h2 :class "display d2" :data-split t (content ':knowledge ':title))
          (p :class "lede" :data-rv t (content ':knowledge ':lede)))
        (div :class "tabgroup kb__carousel"
          (div :class "tabs kb__tabs" :role "tablist" :aria-label "Neurosymbolic examples"
            (loop for (name title) in '(("facts" :facts__title)
                                        ("diagnoses" :diagnosis__title)
                                        ("services" :services__title)
                                        ("compaction" :compaction__title))
                  collect
              (hsx (button :role "tab" :type "button" :data-tab name
                           (content-text ':knowledge title)))))
          (~knowledge-slide :name "facts" :title ':facts__title :prose ':facts__prose
                            :extra   (hsx
                                       (ul :class "kb__links"
                                         (li (content ':knowledge ':inspect))
                                         (li (content ':knowledge ':changes))))
                            :example (~knowledge-derivation))
          (~knowledge-slide :name "diagnoses" :title ':diagnosis__title :prose ':diagnosis__prose
                            :example (~knowledge-diagnosis))
          (~knowledge-slide :name "services" :title ':services__title :prose ':services__prose
                            :extra   (hsx (p :class "prose" (content ':knowledge ':procedure__prose)))
                            :example (~knowledge-procedure))
          (~knowledge-slide :name "compaction" :title ':compaction__title :prose ':compaction__prose
                            :extra   (hsx (p :class "prose" (content ':knowledge ':compaction__changes)))
                            :example (~knowledge-checkpoint)))))))
