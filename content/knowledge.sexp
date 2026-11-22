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
 ("A fact's basis follows its source. A file Autolith read is an observation; your words are a user assertion. Derived facts inherit the basis of their premises, so an assumption cannot become an observation through reasoning. Conflicting facts are both kept and marked as disputed.")
 :procedure__prose
  ("Repeated tool sequences can become parameterized procedures. For a later matching request, Autolith can run the learned sequence with one " (:code nil "procedure.run") " call. Each step keeps its own approval checks.")
 :diagnosis__prose
  ("For a failure with several plausible causes, " (:code nil "diagnosis.run") " selects probes that distinguish them. It can execute a bounded sequence without another model request. If the evidence does not settle the case, the diagnosis stays open.")
 :evidence
  ("Keep the source and basis of each fact. A file observation, your assertion, and a model prediction are different kinds of evidence.")
 :rules
  ("Compute with dates, durations, numbers, and quantities. A proposed rule derives nothing until you admit it; derived facts follow changes in their premises.")
 :contracts
  ("Check a tool's required facts before execution. Missing requirements refuse the call with an explanation; successful results can supply new observations.")
 :inspect
 ((:code nil "(why \"c4df\")") " shows a fact's sources, rule, and premises; " (:code nil "(what-changed)") " lists what moved since you last asked, with the cause."))
