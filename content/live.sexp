;; Copy for the live section. Inline markup: (:em () "text").
(:title
 ("Attach to a session from another " (:em nil "terminal."))
 :lede
 (" Every Autolith instance has an authenticated local endpoint on loopback, keyed by the session ID. You can " (:em nil "(detach)") ", and Autolith will continue your work in the background.")
 :code__cap
 ("From any other terminal on the machine")
 :prose
 ("These are basic monitoring tools you can use to watch running Autolith sessions and instruct them. Autolith also has an opt-in management REPL into the running image, authenticated on every connection, which lets you do anything you like to the agent, with no limitations." (:br nil) (:br nil) "Editors can drive the same sessions over the Agent Client Protocol: point your editor at " (:code nil "autolith acp") " and it gets streamed answers, reasoning, tool activity, approvals, steering, durable follow-ups, and job control." (:br nil) (:br nil) "Calling it a rock formation was considered, but none sounded that well, so old Windows NT terminology it is.")
 :note
 ()
 :subtitle
 ("You can also move your work between machines.")
 :prose-2
 ("The result is an S-expression archive containing conversations, memories, agendas, plans, papercuts, and other session assets. You will not be surprised by something miraculously missing on import")
 :note-2
 (" Even self-modified cores can be rebuilt on another machine by running their replay script. "))
