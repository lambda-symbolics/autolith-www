;; Copy for context. Text and inline HSX-compatible markup.
(:caption
 ((:b nil "Figure 1.") " RLM paritioning")
 :title
 ("Work beyond the context window.")
 :prose
 (" Every model has a hard limit on how much it can read at once." (:br nil) (:br nil) "Autolith can work around it effectively. If you ask it to process a log, a codebase, or a folder of documents far too big to fit, it will use recursive inference tools to partition and process all the data, so it can answer questions about the whole thing." (:br nil) (:br nil) "The approach comes from " (:a (:href "https://arxiv.org/abs/2512.24601" :class "ulink") "Recursive Language Models") ", by Alex L. Zhang, Tim Kraska, and Omar Khattab. Autolith is a compromise between a traditional agent and " (:a (:href "https://github.com/PrimeIntellect-ai/prime-agent") (:strong nil "Prime Agent")) " (which also rocks, by the way!), because it is still mostly a normal agent that just has RLM tools available.")
 :prose-2
 ("Here's how it broadly works: It writes small programs to search and slice the material, sends the parts that matter to itself in separate side conversations, and keeps just those answers. It's like an avalanche." (:br nil) (:br nil) "Autolith will set a ceiling on calls and tokens before RLM starts, so a large question does not blow an insane amount of tokens.")
 :paragraph
 ("32 calls, 400 000 tokens, depth 2")
 :paragraph-2
 ("3.1 MB, 121 " (:code nil "src/*.lisp") " files")
 :paragraph-3
 ("59.6 K tokens in, 915 out")
 :paragraph-4
 ("83 condition classes across 14 subsystems, each with its file")
 :paragraph-5
 ((:code nil "inference:s2Wb1o2") ", which the agent access like any other resource."))
