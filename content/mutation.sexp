;; Copy for the mutation section. Inline markup: (:em () "text").
(:title
 ("Update the running agent without " (:em nil "restarting") " it.")
 :lede
 (" Autolith replaces complete functions, methods, classes, macros, conditions, and global settings in its image at runtime. The change is instantly live." (:br nil) (:br nil) "If it outlives the process depends on you and Autolith. You can have changes that are persisted and changes that aren't.")
 :caption
 ((:b nil "Figure 2.") " Autolith mutations.")
 :prose
 (" " (:b nil "self.redefine") " compiles and installs a complete definition into the image and appends it to the journal." (:br nil) (:br nil) (:b nil "self.exercise") " runs asserts against the pending change to let Autolith verify it did not screw up the change." (:br nil) (:br nil) (:b nil "self.diff") " lets Autolith review all pending changes." (:br nil) (:br nil) (:b nil "self.discard") " is used to discard the live changes that did not really work out, or that you decided you don't want anymore.")
 :prose-2
 (" " (:b nil "self.commit") " turns a pending change into an automatic commit in Autolith's internal git repo. That way, your modified image can be rebuilt when needed.")
 :caption-2
 ((:b nil "Figure 3.") " When Autolith crashes.")
 :subtitle
 ("If Autolith breaks:")
 :prose-3
 ("If you or Autolith somehow manage to crash the process, it will write a crash capsule, boot a separately built pristine image, and select a known-working generation from it. ")
 :prose-4
 (" The conversation you had going on will come back and Autolith will immediately look into what caused the crash in read-only mode." (:br nil) (:br nil) "You can then decide, if there's anything to fix, if and how you want to fix it.")
 :note
 ((:strong nil "Note:") " Most ordinary conditions (AKA errors) do not crash Autolith, but instead start its Lisp debugger and let you and the model decide how to handle the error. "))
