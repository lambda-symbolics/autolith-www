;; Copy for the knowledge section. Inline markup: (:em () "text").
(:title
 ("Leverage " (:em nil "symbolic ") (:em nil "reasoning"))
 :lede
 ("Alongside the language model, Autolith has a small, rule engine similar to Datalog. It is used to associate structured memories and facts with evidence and to derive new information and reason deterministically without LLMs.")
 :facts__title
 ("Facts and derivations")
 :facts__prose
 ("Give Autolith a rule to test packages that depend directly on code changed in a pull request. If a new revision changes the parser instead of the lexer, Autolith updates the test target from the formatter to the CLI. You can inspect the rule and the facts behind the result.")
 :derive__bar
 ("memory:facts · rule test-dependents")
 :derive__stamp
 ("recomputed locally")
 :inspect
 ("Use " (:code nil "(why \"c4df\")") " to see the evidence and rules used to derive the fact in question.")
 :changes
 ("Use " (:code nil "(what-changed)") " to see what changed since you last asked and why.")
 :diagnosis__title
 ("Diagnoses")
 :diagnosis__prose
 ("When encountered with uncertain problem, Autolith can use " (:code nil "diagnosis.run") " to test competing explanations before changing anything." (:br nil) (:br nil) "If the probes do not distinguish the causes, it leaves the diagnosis open, and Autolith can try again or explore other avenues.")
 :diagnosis__bar
 ("diagnosis.run remote-service")
 :diagnosis__stamp
 ("cause found")
 :compaction__title
 ("Symbolic compaction")
 :compaction__prose
 ("When Autolith compacts a long conversation, it writes a typed checkpoint with decisions, constraints, completed work, and a next step. A note can cite an exact message, tool result, or fact, so the next turn can reopen the evidence without loading the whole transcript.")
 :compaction__changes
 ("A fact lives outside the summary. If a cited fact changes or loses its support, Autolith flags that on the next turn. The checkpoint can say what was true then without passing it off as true now.")
 :compaction__bar
 ("compaction.submit · example checkpoint")
 :compaction__decision
 ("Run the CLI tests for PR #42 because it changes the parser.")
 :compaction__evidence
 ("pr.test(pr-42, cli)")
 :compaction__notice
 ("The CLI no longer depends on the parser. The cited fact lost its support."))
