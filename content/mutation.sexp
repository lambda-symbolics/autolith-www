;; Copy for the mutation section. Inline markup: (:em () "text").
(:title
 ("An agent you can " (:em nil "change while it runs."))
 :lede
 ("Somewhere between Emacs and a Lisp Machine: Autolith can inspect its own code and live state, then change how it works to fit your task. Ask for a new command, a different workflow, or a repair. The change is live in the running Common Lisp image.")
 :prose
 ("A modification starts as a trial. Autolith journals the definition, installs it, and runs focused checks. Inspect the pending changes or discard an unwanted trial." (:br nil) (:br nil) "The same runtime contains the agent, its tools, commands, and configuration. Extending it does not require a separate plugin service.")
 :prose-2
 ("You choose which trial changes to keep. Before Autolith saves them, it tests the replay script in a fresh process. You can rebuild the modified agent from the source and replay script, or restore the exact state from a saved image.")
 :subtitle
 ("Recover after a crash.")
 :prose-3
 ("Checkpointing and recovery are part of live self-modification. If a change crashes the process, Autolith writes a crash capsule and boots a separately built pristine image to recover a known-working generation.")
 :prose-4
 ("The conversation is restored for a read-only diagnosis turn. Inspect what happened and decide whether to attempt a repair, rather than losing the work with the process.")
 :note
 ("Many Lisp errors are recoverable without a crash. Inspect the condition and choose an available restart. Process separation limits accidental damage. It does not protect against hostile code."))
