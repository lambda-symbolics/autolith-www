;; Copy for the mutation section. Inline markup: (:em () "text").
(:title
 ("Update the running agent without " (:em nil "restarting") " it.")
:lede
 (" Autolith replaces complete functions, methods, classes, macros, conditions, and global settings in the image it runs in. The change is live at once. Whether it outlives the process depends on what happens next in the journal. ")
:caption
 ((:b nil "Figure 2.")
  " The mutation path. A change passes a check on its way to durable state.")
:prose
 (" " (:b nil "self.redefine")
  " compiles and installs one complete definition in the active image and appends it to the journal. "
  (:b nil "self.exercise") " asserts against the pending change. " (:b nil "self.diff")
  " collapses everything pending to its effective state. " (:b nil "self.discard")
  " puts the newest change back. Being wrong is cheap. ")
:prose-2
 (" " (:b nil "self.commit")
  " turns the pending set into an immutable private image commit: a manifest plus a complete executable replay script, in a separate private Git history. A clean process replays that script and asserts the load-bearing surface survived before the commit becomes selectable. Your working tree is a different repository. ")
:caption-2
 ((:b nil "Figure 3.")
  " The failure path. Recovery boots a separate image and reads the capsule.")
:subtitle
 ("Then break it on purpose.")
:prose-3
 (" Give the formatter behind the live status row a bad redefinition and the process dies on the spot. Autolith writes a private crash capsule, boots a separately built pristine image, and selects a known-working generation from it. ")
:prose-4
 (" The conversation comes back with the scrollback intact. The first turn afterwards reads only: bounded crash context, the workspace, tracked source, active state. It reports, then asks before it repairs anything. ")
:note
 (" When an ordinary form signals, the live restart debugger keeps the failed stack alive and puts "
  (:em nil "Ask Autolith why this failed")
  " beside the restarts, with up to three validated recovery proposals. ")
)
