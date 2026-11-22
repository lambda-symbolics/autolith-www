;; Copy for context. Text and inline HSX-compatible markup.
(:caption
  ("Partition the material; bring back the answer and its trace.")
 :title
  ("Read beyond " (:em nil "one context window."))
 :prose
  ("A large log, codebase, or document collection does not have to fit in the conversation. With " (:a (:href "https://arxiv.org/abs/2512.24601" :class "ulink") "Recursive Language Models") ", Autolith keeps the full input outside its working context, writes programs to search and slice it, and combines answers from bounded inference calls.")
 :prose-2
  ("Each call receives selected evidence and can divide its work further. The main conversation gets a result and an inspectable trace instead of the whole corpus." (:br nil) (:br nil) "Calls, tokens, and recursion depth are budgeted. A run that exhausts its budget may be incomplete. The example below is one source audit; the " (:a (:href "#sessions" :class "ulink") "recorded sessions") " include a separate, larger run.")
 :paragraph
 ("32 calls, 400 000 tokens, depth 2")
 :paragraph-2
 ("3.1 MB, 121 " (:code nil "src/*.lisp") " files")
 :paragraph-3
 ("59.6 K tokens in, 915 out")
 :paragraph-4
 ("83 condition classes across 14 subsystems, each with its file")
 :paragraph-5
 ((:code nil "inference:s2Wb1o2") ", which the agent can read like any other resource."))
