;; Copy for context. Text and inline HSX-compatible markup.
(:title
  ("Read beyond " (:em nil "one context window."))
 :prose
  ("You can ask Autolith to search a log that is too large to fit in the conversation. Autolith uses " (:a (:href "https://arxiv.org/abs/2512.24601" :class "ulink") "recursive language models") " to read the log in parts. Autolith writes code to select relevant excerpts and sends them to the model in separate requests.")
 :prose-2
  ("You get an answer and a trace that you can inspect." (:br nil) (:br nil) "You can limit the number of model requests, the number of tokens and the depth of recursion. If a run reaches a limit, the answer may be incomplete."))
