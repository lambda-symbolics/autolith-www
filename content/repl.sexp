;; Copy for repl. Text and inline HSX-compatible markup.
(:title
 ("The input prompt is a REPL with syntactic sugar.")
 :sugarcaption
 (" " (:span (:class "on") "Prose, typed at the prompt.") " " (:span nil "Autolith reads it as a call to " (:code nil "(prompt)") ".") " " (:span nil "Talk to a specific agent using the " (:code nil ":to") " parameter.") " ")
 :subtitle
 ("Your messages are just calls to" (:em nil " (prompt ...)"))
 :prose
 ("Try the reader below to see how a message becomes a Lisp form. This is a syntax demonstration, not a running agent. In Autolith, use :to to address a child agent.")
 :win__bar
 ("The reader")
 :replnote
 ("Read as a call to " (:code nil "(prompt)") ", addressed to the primary agent.")
 :prose-2
 (" You don't need to know Lisp." (:br nil) (:br nil) "Plain text works, and most people never need to type a Lisp form." (:br nil) (:br nil) "If you want to learn Lisp, start at the prompt. The agent sees the form you entered, its result, and any signaled condition, so you can ask it to explain an error.")
 :subtitle-2
 ("Prompts can be computed.")
 :prose-3
 ("Text, commands, tool calls, and Lisp forms share one input prompt. A Lisp form runs in the Autolith image, and the agent sees its result. Read a prompt from disk, fill in a template, or generate it from the program you are debugging.")
 :subtitle-3
 ("And you can steer any child in the tree.")
 :prose-4
 (" Autolith keeps working while its children run. Talk to one to correct it while it's doing something. Its next text reply comes back to your terminal."))
