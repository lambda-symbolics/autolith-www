;; Copy for the cost section. Inline markup: (:em () "text").
(:title
 ("Spend tokens on the work, " (:em nil "not the bookkeeping."))
 :lede
 ("Autolith avoids polling for finished jobs and keeps bulky command output outside the model context. Fewer requests and smaller previews leave more of the token budget for the work.")
 :waiting-bar
 ("Waiting on a background job")
 :waiting-note
 ("Illustration: each block is a provider request carrying the conversation context. A completion notice wakes the agent without polling.")
 :output-bar
 ("One noisy command, in context")
 :output-note
 ("Illustrative output sizes. Captured output stays in a retained log that the model can page or search without rerunning the command. Capture and retention limits apply.")
 :jobs
 ("Shell, Lisp, RLM, skill, and task work that outlives a ten-second grace period is handed off, not rerun. The finished job continues the turn with a bounded notice, and completions that land together share one turn.")
 :logs
 ("Command output is retained behind a " (:code nil "shell-log:") " reference, subject to capture and retention limits. The model sees a preview of up to 6,000 bytes, weighted toward the tail, and pages or searches the retained output on demand.")
 :lisp
 ((:code nil "lisp.eval") " runs a sequence of forms, and with host tools a Lisp program can call agent tools and branch on their results inside one evaluation. Executable skills turn repeated procedures into tested code.")
 :edits
 ("A language-server rename or code action arrives as one proposal instead of a file-by-file edit loop, and it lands atomically or not at all.")
 :compaction
 ("Unfinished tool calls, running jobs, and steering that arrives mid-summary carry across compaction. The complete history stays searchable through " (:code nil "conversation:") " resources, so old details are fetched instead of carried.")
 :partial
 ("Recursive inference retains its context and trace when the budget runs out. The agent can inspect completed work before deciding how to continue.")
 :rules
 ("Context rules attach guidance only for matching paths, languages, tools, or roles, as ephemeral notes that erode instead of riding along on every request.")
 :guards
 ("Retries after streamed output and repeated tool calls have limits. Exhausted subscription quotas fail at once. Loaded tool definitions are replayed intact to preserve the cacheable prompt prefix."))
