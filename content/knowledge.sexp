;; Copy for the knowledge section. Inline markup: (:em () "text").
(:title
 ("Facts with " (:em nil "receipts") ", rules that keep up.")
 :lede
 ("Beside prose memories, Autolith keeps structured facts. Each one cites its evidence and says why it is believed. Rules derive new facts locally, contracts check tool calls before they run, and work you repeat becomes a procedure.")
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
 ("Where a fact came from decides its basis, not what the model calls it. A file Autolith read is an observation, your own words are a user assertion, and a derived fact keeps the basis of its premises, so reasoning from an assumption never produces an observation. Two facts that disagree are both kept and shown as conflicted; nothing quietly picks a winner.")
 :procedure__prose
 ("When three turns make the same tool calls in the same order, Autolith learns a procedure after the turn, without a model request. Values that vary become parameters, matched to the words that varied in your requests. The next request that fits is offered one " (:code nil "procedure.run") ", and every call inside it still asks its own approval.")
 :diagnosis__prose
 ("Instead of trying repairs in turn, " (:code nil "diagnosis.run") " takes up to four hypotheses and the probes that tell them apart. The probe that separates the most remaining hypotheses per cost runs first, at most three with no model request between them. A case no probe can settle is reported as still open.")
 :evidence
 ("Files, pages, tool results, missions, or your own words. Web pages expire a week after retrieval, and file evidence holds only for the exact content observed.")
 :rules
 ("Dates, durations, numbers, and quantities in units. A rule the model proposes derives nothing until you admit it, and a search that runs out of budget reports unknown, never false.")
 :contracts
 ("A call whose required facts do not hold is refused before it runs, with the reason. Successful calls turn their JSON results, MCP results included, into observed facts.")
 :gates
 ("Plan steps take their values from facts and follow them when they change. A mission gate passes only on undisputed observations or your statements, never on the model's predictions.")
 :recipes
 ("Starter vocabularies for appointments and service dependencies define their predicates and propose their rules in one operation.")
 :inspect
 ((:code nil "(why \"c4df\")") " shows a fact's sources, rule, and premises; " (:code nil "(what-changed)") " lists what moved since you last asked, with the cause."))
