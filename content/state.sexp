;; Copy for state. Text and inline HSX-compatible markup.
(:title
 ("The levels of knowledge")
 :lede
 ("Autolith has several tools and places where it can store information, each with a different purpose and functionality to remind the agent of their existence.")
 :subtitle
 ("Conversations")
 :paragraph
 ("Append-only portable S-expressions-based format which serves as a ledger of everything you said, AL said, and everything that happened, including errors and crashes.")
 :subtitle-2
 ("Memories")
 :paragraph-2
 ("Scoped memories where general facts to be remembered are stored.")
 :subtitle-3
 ("Agenda")
 :paragraph-3
 ("Long term tracking and planning. Imagine it being like a limited-size Jira / Kanban board.")
 :subtitle-4
 ("Plan")
 :paragraph-4
 ("Short-term temporary planning, if you've ever used Codex or Claude Code, you know what this is")
 :subtitle-5
 ("Git image commits")
 :paragraph-5
 ("Complete replay scripts for durable definitions and settings.")
 :subtitle-6
 ("Generations")
 :paragraph-6
 ("We stole this from Nix. A generation contains a saved image version (core), and everything else needed to restore Autolith to a previous state.")
 :subtitle-7
 ("Worker images")
 :paragraph-7
 ("AL can have long-running child Lisp images in which it can develop and triage small programs and experiments. These can be checkpointerd and roll-backed too.")
 :bento__foot
 ("Stores are either append-only or transactional. Shared-state storage places are serialized across processes, meaning that 2+ AL instances can work in the workspace at the same time. "))
