;; Copy for repl. Text and inline HSX-compatible markup.
(:title
  ("Start with words. " (:em nil "Go deeper when you want."))
 :sugarcaption
 (" " (:span (:class "on") "Prose, typed in the channel.") " " (:span nil "Autolith reads it as a call to " (:code nil "(channel.send :text ...)") ".") " " (:span nil "Send to a specific channel using the " (:code nil ":channel") " parameter.") " ")
 :subtitle
  ("One prompt, one runtime.")
 :prose
  ("You don't need to know Lisp. Type an ordinary request, or enter a Lisp form when you want direct control. Try the reader below to see the connection. This is a syntax demonstration, not a running agent.")
 :win__bar
 ("The reader")
 :replnote
 ("Read as a call to " (:code nil "(channel.send :text ...)") ", addressed to the current channel.")
 :prose-2
  ("The prompt is a REPL with syntactic sugar: prose becomes a message to the current channel. If you choose to write Lisp, the agent can see the form, its result, and any signaled condition, so you can ask it to explain an error.")
 :subtitle-2
 ("Messages can be computed.")
 :prose-3
 ("Text, commands, tool calls, and Lisp forms share one input channel. A Lisp form runs in the Autolith image, and the agent sees its result. Read content from disk, fill in a template, or generate it from the program you are debugging.")
 :subtitle-3
  ("Address another channel.")
 :prose-4
  ("Use " (:code nil "channel.send") " to send a message to a specialist. Ask for a focused check, pass new evidence, or correct an assignment while it is running."))
