;; Copy for the missions section. Inline markup: (:em () "text").
(:title
  ("Long-horizon work, " (:em nil "with a finish line."))
 :lede
  ("Pursue a goal across turns, scheduled continuations, and restarts. Persistent plans and agendas retain commitments; missions add explicit acceptance criteria, verification gates, and budgets. Completion depends on evidence, not the model declaring success.")
 :criteria
 ("You write the acceptance criteria. The model cannot weaken them, and a criterion without a gate needs your explicit evidence before the mission can pass.")
 :gates
  ("Run command, artifact, Lisp, or fact-based checks with explicit limits. Retain each result and its input fingerprint so verification follows the actual work.")
 :budgets
  ("Bound turns, tokens, and wall-clock time across the primary agent, children, compaction, and recursive inference. Parallel work shares the same allowance.")
 :reviews
  ("Request an independent review against a fixed snapshot. Unresolved findings block acceptance.")
 :schedules
 ("Wake a mission at a time, on an interval, or on an external event. Due work enters the ordinary command queue under the same budgets.")
 :durability
  ("Retain plans, gate attempts, evidence, and spend with the conversation. Compaction preserves the working context without replacing the durable records.")
 :note
 ("For lighter work, " (:code nil "(goal \"…\")") " sets an objective without the ceremony. Start a mission with " (:code nil "(mission \"start …\")") " and watch it with " (:code nil "(mission \"status\")") ".")
 :win__bar
 ("(mission \"status\")")
 :objective
 ("Deliver the accepted build"))
