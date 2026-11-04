;; Copy for the live section. Inline markup: (:em () "text").
(:title
 ("Attach to a session from another " (:em nil "terminal."))
 :lede
 (" Every Autolith instance has an authenticated local endpoint on loopback, keyed by the session ID. You can " (:em nil "(detach)") ", and Autolith will continue your work in the background.")
 :code__cap
 ("From any other terminal on the machine")
 :prose
 ("Use these commands to inspect, steer, or attach to running sessions. An opt-in management REPL gives authenticated clients direct Lisp access to the running image. Enable it only for clients you trust." (:br nil) (:br nil) "Editors can drive the same sessions over the Agent Client Protocol: point your editor at " (:code nil "autolith acp") " and it gets streamed answers, reasoning, tool activity, approvals, steering, durable follow-ups, and job control." (:br nil) (:br nil) "We considered naming it after a rock formation, but none sounded right. Old Windows NT terminology it is.")
 :note
 ()
 :subtitle
 ("You can also move your work between machines.")
 :prose-2
 ("Export writes an S-expression archive of conversations, memories, agendas, plans, papercuts, and other session assets. Import it into the target workspace to continue there.")
 :note-2
 (" Rebuild a self-modified agent on another supported machine from source and its private replay script; a saved core itself is platform-specific."))
