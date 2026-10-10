(in-package #:autolith-www)

(defparameter *cost-poll-points* '(20 40 60 80 100)
  "Where along a background job the polling agent sends a request, in percent.")

(defcomp ~cost-request (&key at (wake nil))
  "Render one provider request on a lane, AT percent along the job."
  (hsx
    (i :class (if wake "lane__req lane__req--wake" "lane__req")
       :style (format nil "--at:~a%;--t:~,2fs" at (* at 0.042)))))

(defcomp ~cost-lanes ()
  "Render the waiting chart: a polling lane against a lane woken by completion."
  (hsx
    (div :class "lanes"
      (div :class "lane"
        (span "polling")
        (span :class "lane__track"
          (i :class "lane__job")
          (loop for at in *cost-poll-points* collect
            (hsx (~cost-request :at at))))
        (span :class "lane__count" "5 requests"))
      (div :class "lane"
        (span "Autolith")
        (span :class "lane__track"
          (i :class "lane__job")
          (~cost-request :at 100 :wake t))
        (span :class "lane__count" "1 request")))))

(defcomp ~cost-meters ()
  "Render the output chart: inline output before against today's preview."
  (hsx
    (div :class "meters"
      (div :class "meter" :style "--w:100%"
        (span "inline, 0.50")
        (span :class "meter__bar"
          (i :class "meter__fill"))
        (span :class "meter__value" "65,536 characters"))
      (div :class "meter" :style "--w:9.2%"
        (span "preview now")
        (span :class "meter__bar"
          (i :class "meter__fill")
          (i :class "meter__rest"))
        (span :class "meter__value" "6,000 bytes, the rest in a shell log")))))

(defcomp ~section-cost nil
  "Render the cost section: the round trips Autolith no longer makes."
  (hsx
    (section :class "band" :id "cost"
      (div :class "wrap wrap--wide"
        (div :class "lede-block"
          (h2 :class "display d2" :data-split t
            (content ':cost ':title))
          (p :class "lede" :data-rv t
            (content ':cost ':lede)))
        (div :class "costviz"
          (figure :class "win shadowband chart" :data-chart t :data-rv "fade"
            (figcaption :class "win__bar"
              (content ':cost ':waiting-bar))
            (div :class "win__body chart__body"
              (~cost-lanes)
              (p :class "chart__note"
                (content ':cost ':waiting-note))))
          (figure :class "win shadowband chart" :data-chart t :data-rv "fade"
            (figcaption :class "win__bar"
              (content ':cost ':output-bar))
            (div :class "win__body chart__body"
              (~cost-meters)
              (p :class "chart__note"
                (content ':cost ':output-note)))))
        (dl :class "deflist deflist--two" :data-rv t
          (div
            (dt "Jobs wake the agent")
            (dd
              (content ':cost ':jobs)))
          (div
            (dt "Logs, not dumps")
            (dd
              (content ':cost ':logs)))
          (div
            (dt "Many steps, one call")
            (dd
              (content ':cost ':lisp)))
          (div
            (dt "One edit, many files")
            (dd
              (content ':cost ':edits)))
          (div
            (dt "Compaction keeps the work")
            (dd
              (content ':cost ':compaction)))
          (div
            (dt "Partial results are kept")
            (dd
              (content ':cost ':partial)))
          (div
            (dt "Advice only when relevant")
            (dd
              (content ':cost ':rules)))
          (div
            (dt "Spend guards")
            (dd
              (content ':cost ':guards))))))))
