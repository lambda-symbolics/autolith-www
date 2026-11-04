;; Copy for the mutation section. Inline markup: (:em () "text").
(:title
 ("Update the running agent without " (:em nil "restarting") " it.")
 :lede
 (" Autolith replaces complete functions, methods, classes, macros, conditions, and global settings in its image at runtime. The change is instantly live." (:br nil) (:br nil) "You decide which changes to persist. Trial changes last only for the current process unless you commit them.")
 :caption
 ((:b nil "Figure 2.") " Autolith mutations.")
 :prose
 (" " (:b nil "self.redefine") " journals a complete definition before compiling and installing it in the image." (:br nil) (:br nil) (:b nil "self.exercise") " runs assertions against a pending change to check its behavior." (:br nil) (:br nil) (:b nil "self.diff") " lets Autolith review all pending changes." (:br nil) (:br nil) (:b nil "self.discard") " restores the definitions or settings from before an unwanted trial change.")
 :prose-2
 (" " (:b nil "self.commit") " persists pending changes as a replay script in Autolith's private Git history, after checking the replay in a clean process. Your modified agent can then be rebuilt from source and that script." (:br nil) (:br nil) "After an update, overrides whose tracked source has moved on are skipped instead of silently replacing new code, and " (:code nil "(fix-skipped-definitions)") " asks Autolith to rebuild them against the current source.")
 :caption-2
 ((:b nil "Figure 3.") " When Autolith crashes.")
 :subtitle
 ("If Autolith breaks:")
 :prose-3
 ("If you or Autolith somehow manage to crash the process, it will write a crash capsule, boot a separately built pristine image, and select a known-working generation from it. ")
 :prose-4
 (" Autolith restores the conversation and starts a read-only diagnosis turn to investigate the crash." (:br nil) (:br nil) "You decide whether to attempt a repair.")
 :note
 ((:strong nil "Note:") " Many Lisp errors can be handled through the debugger without ending the process. You and the model can inspect the condition and choose an available restart."))
