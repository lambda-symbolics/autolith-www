;; Copy for the missions section. Inline markup: (:em () "text").
(:title
  ("You decide " (:em nil "what counts as done."))
 :lede
  ("Use a mission if you need to check the result before you accept it. You can resume a mission after a restart.")
 :criteria
 ("You set the acceptance criteria. If a criterion has no automated check, you must provide evidence that it was met.")
 :gates
 ("You can use a test command as a gate. Autolith records each result and the inputs used for the check.")
 :budgets
  ("Bound turns, tokens, and wall-clock time across the primary agent, children, compaction, and recursive inference. Parallel work shares the same allowance.")
 :reviews
  ("Request an independent review against a fixed snapshot. Unresolved findings block acceptance.")
 :schedules
 ("Wake a mission at a time, on an interval, or on an external event. Due work enters the ordinary command queue under the same budgets.")
 :durability
  ("Retain plans, gate attempts, evidence, and spend with the conversation. Compaction preserves the working context without replacing the durable records.")
 :win__bar
 ("(mission \"status\")")
 :objective
 ("Deliver the accepted build"))
