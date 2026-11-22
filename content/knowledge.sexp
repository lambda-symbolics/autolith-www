;; Copy for the knowledge section. Inline markup: (:em () "text").
(:title
  ("Remember, then " (:em nil "reason."))
 :lede
  ("Alongside the language model, Autolith has a small, Datalog-style rule engine. It keeps facts with their sources and runs the rules you approve locally, without another model request.")
 :facts__title
  ("Facts and derivations")
 :facts__prose
  ("Tell Autolith when your review starts and give it a rule for when to leave. When the start time changes, it recalculates the departure time. A derivation keeps track of the rule and the facts it used. A guess does not become an observation just because a rule used it.")
 :derive__bar
  ("memory:facts · rule departure v1")
 :derive__stamp
  ("recomputed locally")
 :inspect
  ("Use " (:code nil "(why \"c4df\")") " to see the evidence and any rule used to derive that fact.")
 :changes
  ("Use " (:code nil "(what-changed)") " to see what changed since you last asked and why.")
 :diagnosis__title
  ("Diagnoses")
 :diagnosis__prose
  ("If billing stops responding, use " (:code nil "diagnosis.run") " to test competing explanations before changing anything. Autolith can run several probes without another model request. If they do not distinguish the causes, it leaves the diagnosis open.")
 :diagnosis__bar
  ("diagnosis.run remote-service")
 :diagnosis__stamp
  ("cause found")
 :services__title
  ("Services")
 :services__prose
  ("Give a service call a contract that declares what must be true before it runs and what facts to record from the result. If a required fact is missing, Autolith skips the call and tells you why.")
 :procedure__prose
  ("Autolith can also learn a reusable procedure across several calls. Next quarter, one " (:code nil "procedure.run") " call can load the sales data, build the report, and send it. Each step still goes through its own approval checks.")
 :procedure__bar
  ("procedure make-sales-report")
 :procedure__stamp
  ("learned from 3 turns")
 :compaction__title
  ("Symbolic compaction")
 :compaction__prose
  ("When Autolith compacts a long conversation, it writes a typed checkpoint with decisions, constraints, completed work, and a next step. A note can cite an exact message, tool result, or fact, so the next turn can reopen the evidence without loading the whole transcript.")
 :compaction__changes
  ("A fact lives outside the summary. If a cited fact changes or loses its support, Autolith flags that on the next turn. The checkpoint can say what was true then without passing it off as true now.")
 :compaction__bar
  ("compaction.submit · example checkpoint")
 :compaction__decision
  ("Leave at 13:50 for the review.")
 :compaction__evidence
  ("event.departure(review, 13:50)")
 :compaction__notice
  ("The review moved to 15:00. The same rule now gives 14:20."))
