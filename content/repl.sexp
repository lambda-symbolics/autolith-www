;; Copy for repl. Text and inline HSX-compatible markup.
(:title
 ("Messages are just syntax " (:em nil "sugar."))
:sugarcaption
 (" " (:span (:class "on") "Prose, typed at the prompt.") " "
  (:span nil "Autolith reads it as a call to " (:code nil "(prompt)") ".") " "
  (:span nil "Talk to a specific agent using the " (:code nil ":to")
   " parameter.")
  " ")
:subtitle
 ("Type something.")
:prose
 ("This browser demonstration wraps prose in a prompt call and leaves parenthesized input unchanged. It does not run Lisp.")
:win__bar
 ("The reader")
:replnote
 ("Read as a call to " (:code nil "(prompt)")
  ", addressed to the primary agent.")
:prose-2
 (" You do not need to know Lisp. Prose works, and most people never type a form. If you want to learn it, this is a good place to start: the input is a real REPL, and the agent sees what you typed, what came back, and any condition it signalled, so you can ask it why. ")
:subtitle-2
 ("So a prompt can be computed.")
:prose-3
 (" Prose, commands, tools, and Common Lisp share one input. A form runs in the active image and the model sees the result. Read a prompt off disk, template it, or generate it from the program you are debugging. ")
:subtitle-3
 ("And you can steer any child in the tree.")
:prose-4
 (" Autolith keeps working while its children run. Address one by name to correct it mid-flight. Its next useful reply comes back to the primary terminal. ")
)
