;; Copy for the knowledge section. Inline markup: (:em () "text").
(:title
 ("Facts with " (:em nil "receipts") ", rules that keep up.")
 :lede
 ("Alongside prose memories, Autolith keeps structured facts with their sources and basis. Rules derive facts locally, contracts check tool requirements before execution, and repeated tool sequences can become procedures.")
 :derive__bar
 ("memory:facts · rule departure v1")
 :derive__caption
 ((:b nil "Figure 5.") " The meeting moves; the departure follows without a model request.")
 :derive__stamp
 ("recomputed locally")
 :procedure__bar
 ("procedure make-sales-report")
 :procedure__caption
 ((:b nil "Figure 6.") " Three turns making the same calls become one call.")
 :procedure__stamp
 ("learned from 3 turns")
 :diagnosis__bar
 ("diagnosis.run remote-service")
 :diagnosis__caption
 ((:b nil "Figure 7.") " Each probe rules a hypothesis out; nothing is guessed.")
 :diagnosis__stamp
 ("cause found")
 :prose
 ("A fact's basis follows its source. A file Autolith read is an observation; your words are a user assertion. Derived facts inherit the basis of their premises, so an assumption cannot become an observation through reasoning. Conflicting facts are both kept and marked as disputed.")
 :procedure__prose
 ("When three turns repeat a matching tool sequence, Autolith can learn a procedure without a model request. Varying values become parameters matched to the changing words in your requests. For a later matching request, the agent receives a notice to use " (:code nil "procedure.run") ". Each call inside it goes through its own approval checks.")
 :diagnosis__prose
 ("Before trying repairs, " (:code nil "diagnosis.run") " takes up to four hypotheses and probes that distinguish them. It ranks probes by how well they separate the remaining hypotheses relative to their cost, then runs up to three without another model request. If the probes cannot settle the case, it reports it as open.")
 :evidence
 ("Files, pages, tool results, missions, or your own words. Web pages expire a week after retrieval, and file evidence holds only for the exact content observed.")
 :rules
 ("Dates, durations, numbers, and quantities in units. A rule the model proposes derives nothing until you admit it, and a search that runs out of budget reports unknown, never false.")
 :contracts
 ("A matching contract refuses a call whose required facts do not hold and explains why. After a successful call, its declared observation mappings turn selected JSON result fields, including MCP results, into observed facts.")
 :gates
 ("Plan steps can name required facts and use their current values. Fact-based mission gates accept undisputed observations or your statements, not the model's predictions.")
 :recipes
 ("Starter vocabularies for appointments and service dependencies define their predicates and propose their rules in one operation.")
 :inspect
 ((:code nil "(why \"c4df\")") " shows a fact's sources, rule, and premises; " (:code nil "(what-changed)") " lists what moved since you last asked, with the cause."))
