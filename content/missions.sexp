;; Copy for the missions section. Inline markup: (:em () "text").
(:title
 ("Dispatch " (:em nil "structured missions."))
 :lede
 ("Use Autolith missions if you need to validate results before accepting them. Missions are essentially an extension of the /goal command found in many harnesses. Agents can help you design missions.")
 :criteria
 ("You set the acceptance criteria. If a criterion has no automated check, you must provide evidence that it was met.")
 :gates
 ("You can use test commands as gates. Autolith records all results and the inputs used for every check.")
 :budgets
 ("Set limits for turns, token spend, and wall-clock time across the primary agent, children, compactions, and recursive inference.")
 :reviews
 ("Request independent reviews against a fixed snapshot, where unresolved review findings will block acceptance.")
 :schedules
 ("Wake missions at a time, on an interval, or when triggered by external events.")
 :durability
 ("Retain plans, gate attempts, evidence, and spend with the conversation. Compaction preserves the working context without replacing the durable records.")
 :win__bar
 ("(mission \"status\")")
 :objective
 ("Deliver an accepted build"))
