;; Copy for context. Text and inline HSX-compatible markup.
(:caption
 ((:b nil "Figure 1.") " RLM partitioning")
 :title
 ("Work beyond the context window.")
 :prose
 (" Every model has a hard limit on how much it can read at once." (:br nil) (:br nil) "For a log, codebase, or folder of documents too large to fit, Autolith can divide the material among recursive inference calls and combine their answers. The full input stays outside the main conversation." (:br nil) (:br nil) "The approach comes from " (:a (:href "https://arxiv.org/abs/2512.24601" :class "ulink") "Recursive Language Models") ", by Alex L. Zhang, Tim Kraska, and Omar Khattab. Autolith is a compromise between a traditional agent and " (:a (:href "https://github.com/PrimeIntellect-ai/prime-agent") (:strong nil "Prime Agent")) " (which also rocks, by the way!): a conventional agent with RLM tools it can use when needed.")
 :prose-2
 ("It writes small programs to search and slice the material, sends selected parts to separate model conversations, and combines the answers. Those conversations can split their own work further." (:br nil) (:br nil) "Each run has limits on calls, tokens, and recursion depth. If it reaches a limit, its retained context and trace are available for follow-up work; the answer may be incomplete.")
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
