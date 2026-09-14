;; Copy for the live section. Inline markup: (:em () "text").
(:title
 ("Attach to a session from another " (:em nil "terminal."))
:lede
 (" Every running Autolith publishes a private authenticated endpoint on loopback, keyed by the conversation identifier and guarded by a capability token. Detach and the session moves to a supervised process group that outlives your terminal. ")
:code__cap
 ("From any other terminal on the machine")
:prose
 (" Many observers, one controller. Take over and the previous controller loses the session. Output arrives in order for everyone watching. "
  (:b nil "tell") " also wakes a paused session, " (:b nil "pause")
  " cancels active work and holds the queue, " (:b nil "kill")
  " asks for a graceful shutdown. ")
:note
 (" On Windows a session runs in the terminal that started it. The endpoint and these commands work the same. ")
:subtitle
 ("And it moves between machines.")
:prose-2
 (" One readable S-expression archive: conversations, memories, agendas, plans, papercuts, and session assets. Import preserves stable identifiers and merges into local data. ")
:note-2
 (" Even self-modified cores can be rebuilt on another machine. ")
)
