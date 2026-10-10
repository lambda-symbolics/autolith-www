;; Copy for the cost section. Inline markup: (:em () "text").
(:title
 ("Spend tokens on the work, " (:em nil "not the bookkeeping."))
 :lede
 ("Most agent spend goes on round trips that resend the whole context. Autolith cuts out the ones that do not move the work forward.")
 :waiting-bar
 ("Waiting on a background job")
 :waiting-note
 ("Every block is a provider request that resends the conversation. A finished job wakes the turn instead of being polled for.")
 :output-bar
 ("One noisy command, in context")
 :output-note
 ("The complete output stays in a retained log that the model can page or search later, without running the command again.")
 :jobs
 ("Shell, Lisp, RLM, skill, and task work that outlives a ten-second grace period is handed off, not rerun. The finished job continues the turn with a bounded notice, and completions that land together share one turn.")
 :logs
 ("Every command keeps its full output behind a " (:code nil "shell-log:") " reference. The model sees a 6,000-byte preview weighted toward the tail, where the errors are, and pages or greps the rest on demand.")
 :lisp
 ((:code nil "lisp.eval") " runs a sequence of forms, and with host tools a Lisp program can call agent tools and branch on their results inside one evaluation. Executable skills turn repeated procedures into tested code.")
 :edits
 ("A language-server rename or code action arrives as one proposal instead of a file-by-file edit loop, and it lands atomically or not at all.")
 :compaction
 ("Unfinished tool calls, running jobs, and steering that arrives mid-summary carry across compaction. The complete history stays searchable through " (:code nil "conversation:") " resources, so old details are fetched instead of carried.")
 :partial
 ("When recursive inference reaches its budget it returns what it finished and a context to resume from, so work already paid for is not thrown away.")
 :rules
 ("Context rules attach guidance only for matching paths, languages, tools, or roles, as ephemeral notes that erode instead of riding along on every request.")
 :guards
 ("Retries after streamed output are capped, exhausted subscription quotas fail at once, runaway repeated tool calls are stopped, and loaded tool definitions are replayed intact so the prompt cache keeps growing."))
