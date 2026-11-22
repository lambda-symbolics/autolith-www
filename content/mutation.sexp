;; Copy for the mutation section. Inline markup: (:em () "text").
(:title
 ("An agent you can " (:em nil "change while it runs."))
 :lede
 ("Somewhere between Emacs and a Lisp Machine: Autolith can inspect its own code and live state, then change how it works to fit your task. Ask for a new command, a different workflow, or a repair. The change is live in the running Common Lisp image.")
 :caption
 ("Live changes, checked before they become durable.")
 :prose
 ("A modification starts as a trial. Autolith journals the definition, installs it, and runs focused checks. Inspect the pending changes or discard an unwanted trial." (:br nil) (:br nil) "The same runtime contains the agent, its tools, commands, and configuration. Extending it does not require a separate plugin service.")
 :prose-2
 ("A private image commit retains the complete replay script only after a clean-process check. Saved-core generations preserve exact working states; the source and replay script let you reconstruct the modified agent." (:br nil) (:br nil) "Choose which changes to keep. Trial changes last for the current process unless committed.")
 :caption-2
 ("A pristine recovery image, separate from the modified agent.")
 :subtitle
 ("Experiment, with a way back.")
 :prose-3
 ("Checkpointing and recovery are part of live self-modification. If a change crashes the process, Autolith writes a crash capsule and boots a separately built pristine image to recover a known-working generation.")
 :prose-4
 ("The conversation is restored for a read-only diagnosis turn. Inspect what happened and decide whether to attempt a repair, rather than losing the work with the process.")
 :note
 ("Many Lisp errors are recoverable without a crash. Inspect the condition and choose an available restart. Process separation limits accidental damage; it is not a hostile-code security boundary."))
