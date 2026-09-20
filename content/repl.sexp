;; Copy for repl. Text and inline HSX-compatible markup.
(:title
 ("The input prompt is a REPL with syntactic sugar.")
 :sugarcaption
 (" " (:span (:class "on") "Prose, typed at the prompt.") " " (:span nil "Autolith reads it as a call to " (:code nil "(prompt)") ".") " " (:span nil "Talk to a specific agent using the " (:code nil ":to") " parameter.") " ")
 :subtitle
 ("Your messages are just calls to" (:em nil " (prompt ...)"))
 :prose
 ("You can try it here. This syntax lets you send messages to sub-agents (you will see their responses if they decide to respond). ")
 :win__bar
 ("The reader")
 :replnote
 ("Read as a call to " (:code nil "(prompt)") ", addressed to the primary agent.")
 :prose-2
 (" You don't need to know Lisp." (:br nil) (:br nil) "Plain text works, and most people never need to type a Lisp form." (:br nil) (:br nil) "But... If you want to learn it, AL is a good place to start: the input is a Lisp REPL, the agent sees what you typed, its result, and any condition (AKA error) it produced, so you can ask it why it failed and let it help you out. ")
 :subtitle-2
 ("Prompts can be computed.")
 :prose-3
 ("Text, commands, tools, and Common Lisp are the same text input. A Lisp form runs in the Autolith image and the agent sees its result. Read a prompt off disk, template it, or, I dunno, generate it from the program you are debugging. ")
 :subtitle-3
 ("And you can steer any child in the tree.")
 :prose-4
 (" Autolith keeps working while its children run. Talk to one to correct it while it's doing something. Its next text reply comes back to your terminal."))
