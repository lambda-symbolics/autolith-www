;; Copy for state. Text and inline HSX-compatible markup.
(:title
 ("What Autolith remembers")
 :lede
 ("Conversations, memories, agendas, and plans serve different purposes. Replay scripts and saved images preserve changes to the agent itself.")
 :subtitle
 ("Conversations")
 :paragraph
 ("An append-only, portable S-expression record of messages, tool activity, and runtime events, including errors and crashes.")
 :subtitle-2
 ("Memories")
 :paragraph-2
 ("Notes recalled for the current workspace, plus global notes shared across workspaces.")
 :subtitle-3
 ("Agenda")
 :paragraph-3
 ("Long-term commitments, blockers, and decisions. Think of a small Kanban board shared across sessions.")
 :subtitle-4
 ("Plan")
 :paragraph-4
 ("A short-term checklist for the current task, with progress recorded as the agent works.")
 :subtitle-5
 ("Git image commits")
 :paragraph-5
 ("Complete replay scripts for durable definitions and settings.")
 :subtitle-6
 ("Generations")
 :paragraph-6
 ("We stole this from Nix. A generation pairs a saved Lisp core with the metadata needed to select and restore that version of the agent.")
 :subtitle-7
 ("Worker images")
 :paragraph-7
 ("AL runs programs and experiments in heap-isolated Lisp workers. Save a useful worker image and restore it for later work.")
 :bento__foot
 ("Stores are append-only or transactional. Writes to shared state are serialized across processes, so multiple AL instances can use the same workspace."))
