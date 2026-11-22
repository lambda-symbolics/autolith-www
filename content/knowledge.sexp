;; Copy for the knowledge section. Inline markup: (:em () "text").
(:title
  ("Remember, then " (:em nil "reason."))
 :lede
  ("Neurosymbolic means combining model inference with explicit knowledge and local computation. Autolith retains prose memories, sourced facts, and reusable procedures across tasks. Admitted rules derive new facts without another model request, so you do not have to put every detail back into the prompt.")
 :derive__bar
 ("memory:facts · rule departure v1")
 :derive__stamp
 ("recomputed locally")
 :procedure__bar
 ("procedure make-sales-report")
 :procedure__caption
  ("Repeated tool sequences become a reusable procedure.")
 :procedure__stamp
 ("learned from 3 turns")
 :diagnosis__bar
 ("diagnosis.run remote-service")
 :diagnosis__caption
  ("Probe competing explanations before attempting a repair.")
 :diagnosis__stamp
 ("cause found")
 :prose
 ("Autolith records information read from a file as an observation. It records what you tell it as a user assertion. An assumption is not promoted to an observation by applying a rule. Autolith keeps conflicting facts and marks them as disputed.")
 :procedure__prose
  ("Repeated tool sequences can become parameterized procedures. For a later matching request, Autolith can run the learned sequence with one " (:code nil "procedure.run") " call. Each step keeps its own approval checks.")
 :diagnosis__prose
  ("If a failure has several plausible causes, use " (:code nil "diagnosis.run") " to test them. Autolith can run several checks without another model request. If the checks are inconclusive, Autolith leaves the diagnosis open.")
 :evidence
  ("Keep the source and basis of each fact. A file observation, your assertion, and a model prediction are different kinds of evidence.")
 :rules
  ("You decide which rules can be used. If the facts used by a rule change, Autolith recalculates the result.")
 :contracts
  ("If the required facts are missing, Autolith skips the call and explains why. Autolith can record facts from successful results.")
 :inspect
  ("Use " (:code nil "(why \"c4df\")") " to see the evidence and any rule used to derive that fact.")
 :changes
  ("Use " (:code nil "(what-changed)") " to see what changed since you last asked and why."))
