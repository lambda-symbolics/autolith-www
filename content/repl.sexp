;; Copy for repl. Text and inline HSX-compatible markup.
(:title
 ("The input channel is a REPL with syntactic sugar.")
 :sugarcaption
 (" " (:span (:class "on") "Prose, typed in the channel.") " " (:span nil "Autolith reads it as a call to " (:code nil "(channel.send :text ...)") ".") " " (:span nil "Send to a specific channel using the " (:code nil ":channel") " parameter.") " ")
 :subtitle
 ("Your messages are just" (:em nil " (channel.send :text ...)") )
 :prose
 ("Try the reader below to see how a message becomes a Lisp form. This is a syntax demonstration, not a running agent. In Autolith, use :channel to address another channel.")
 :win__bar
 ("The reader")
 :replnote
 ("Read as a call to " (:code nil "(channel.send :text ...)") ", addressed to the current channel.")
 :prose-2
 (" You don't need to know Lisp." (:br nil) (:br nil) "Plain text works, and most people never need to type a Lisp form." (:br nil) (:br nil) "If you want to learn Lisp, start at the channel. The agent sees the form you entered, its result, and any signaled condition, so you can ask it to explain an error.")
 :subtitle-2
 ("Messages can be computed.")
 :prose-3
 ("Text, commands, tool calls, and Lisp forms share one input channel. A Lisp form runs in the Autolith image, and the agent sees its result. Read content from disk, fill in a template, or generate it from the program you are debugging.")
 :subtitle-3
 ("And you can steer any child in the tree.")
 :prose-4
 (" Autolith keeps working while its children run. Talk to one to correct it while it's doing something. Its next text reply comes back to your terminal."))
