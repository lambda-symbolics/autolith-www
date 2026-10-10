;; Copy for the missions section. Inline markup: (:em () "text").
(:title
 ("Give it a " (:em nil "mission,") " not just a prompt.")
 :lede
 ("Long-running work gets acceptance criteria you write, verification gates the harness runs, and hard limits on turns, tokens, and wall-clock time. The model can ask to be verified. Only the evidence can say yes.")
 :criteria
 ("You write the acceptance criteria. The model cannot weaken them, and a criterion without a gate needs your explicit evidence before the mission can pass.")
 :gates
 ("Command, artifact, and Lisp gates run in order, each with its own timeout and attempt limit. Deterministic gates fingerprint their input files, so an unchanged pass stays proven and an unchanged failure is not run again.")
 :budgets
 ("One allowance covers the primary agent, its children, compaction, and recursive inference. Every request reserves its output ceiling before it starts, so parallel children cannot overspend, and prompt-cache reads are not counted.")
 :reviews
 ("Attach an independent reviewer with its own snapshot, its own allowance, and no tools. Pending findings block acceptance, and an unchanged snapshot is never reviewed twice.")
 :schedules
 ("Wake a mission at a time, on an interval, or on an external event. Due work enters the ordinary command queue under the same budgets.")
 :durability
 ("Gate attempts, fingerprints, evidence, and spend restore with the conversation and survive compaction, independently of anything the model summarized.")
 :note
 ("For lighter work, " (:code nil "(goal \"…\")") " sets an objective without the ceremony. Start a mission with " (:code nil "(mission \"start …\")") " and watch it with " (:code nil "(mission \"status\")") ".")
 :win__bar
 ("(mission \"status\")")
 :objective
 ("Deliver the accepted build"))
