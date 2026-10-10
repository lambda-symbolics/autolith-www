;; Copy for the tasks section. Inline markup: (:em () "text").
(:title
 ("Delegate into " (:em nil "isolated") " worktrees.")
 :lede
 ("Children edit and test in their own Git checkouts, report back in one standard shape, and wake the primary turn when they finish. Nobody sits there polling.")
 :caption
 ((:b nil "Figure 4.") " Parallel children, deliberate integration.")
 :prose
 ("Give " (:code nil "task.run") " an isolation object and the child works in a detached worktree at an exact baseline. It returns an engineering artifact: a patch or commit range with the paths it touched, the checks it ran, the evidence, open issues, and integration notes." (:br nil) (:br nil) "The parent checks each artifact against the target and applies them in the order it chooses, resolving conflicts on purpose instead of by accident.")
 :prose-2
 ("After a restart, retained work is sorted into live, completed, safe to restart, or needing a decision. Autolith asks before it repeats anything with side effects.")
 :inventory
 ("A live inventory of owned work with lineage, timing, usage, and artifacts. Read a child's transcript, send it a correction, or cancel it.")
 :engineering
 ("The bundled engineering role returns the artifact contract, and your own roles can extend it with extra required fields.")
 :semantic
 ((:code nil "lsp.semantic") " turns a language server's rename, code action, or file move into one retained proposal. Applying it checks every file's revision and rolls the whole set back if anything fails.")
 :structural
 ("Optional ast-grep queries and rewrites, previewed first and published under the same stale-revision checks as every other edit.")
 :peers
 ("Grant one agent a durable, one-way channel to another, even across sessions. Messages are coordination data and never carry extra authority.")
 :debugger
 ("Optional Debug Adapter Protocol sessions: launch or attach, set breakpoints, step, and inspect variables, each behind exact approval."))
