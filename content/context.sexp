;; Copy for context. Text and inline HSX-compatible markup.
(:caption
 ((:b nil "Figure 1.")
  " One root completion. The corpus is an environment. Only frame results cross back.")
:title
 ("Work beyond the context window.")
:prose
 (" Every model has a hard limit on how much it can read at once. Autolith works around it. Point it at a log, a codebase, or a folder of documents far too big to fit, and it will answer questions about the whole thing. The method comes from "
  (:a (:class "ulink" :href "https://arxiv.org/abs/2512.24601")
   "Recursive Language Models")
  ", by Alex L. Zhang, Tim Kraska, and Omar Khattab. ")
:prose-2
 (" It does not try to read everything. It writes small programs to search and slice the material, sends the parts that matter to itself in separate side conversations, and keeps only the answers. Those side conversations never touch yours. A hundred of them add one line to your screen. You set the ceiling on calls and tokens before it starts, so a large question cannot turn into a runaway bill. ")
:paragraph
 ("32 calls, 400 000 tokens, depth 2")
:paragraph-2
 ("3.1 MB, 121 " (:code nil "src/*.lisp") " files")
:paragraph-3
 ("59.6 K tokens in, 915 out")
:paragraph-4
 ("83 condition classes across 14 subsystems, each with its file")
:paragraph-5
 ((:code nil "inference:s2Wb1o2") ", readable in session")
)
