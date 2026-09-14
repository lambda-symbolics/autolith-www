;; Copy for image. Text and inline HSX-compatible markup.
(:title
 ("The whole agent is one Common Lisp " (:em nil "image."))
:prose
 (" One image holds the provider client, the terminal, the tool registry, the MCP connections, the conversation store, the memories, the agenda, and the code that runs the turn. The agent reads and edits all of it at the same address. ")
:prose-2
 ("Common Lisp provides " (:code nil "describe")
  ", conditions, restarts, CLOS protocols, and source forms at runtime. The agent uses them to inspect and change its own implementation.")
:prose-3
 ("File search runs in-process through "
  (:a (:href "https://github.com/dmtrKovalenko/fff.nvim") "fff")
  ", a Rust library. Separate, persistent Lisp workers provide REPLs for experiments and scripts.")
:caption
 ("One SBCL image, one process")
:subtitle
 ("In your repository")
:paragraph
 ("Filesystem, shell, and search tools with results you can see.")
:paragraph-2
 ("Run Autolith inside your own workflows through its bounded headless mode, which prescribes the input and output schemas.")
:subtitle-2
 ("In its own image")
:paragraph-3
 ("A runtime it can inspect, test, and extend, with heap-isolated workers for experiments.")
:paragraph-4
 ("Recursive inference over corpora too large for the model window.")
:paragraph-5
 ("Portable conversations, memories, agendas, checkpoints, and recovery.")
)
