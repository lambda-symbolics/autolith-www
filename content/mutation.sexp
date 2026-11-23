;; Copy for the mutation section. Inline markup: (:em () "text").
(:title
 ("The " (:em nil (:em nil "self-modifying") ",") " adaptable agent")
 :lede
 ("Autolith is a flexible computing environment similar to Emacs or a Lisp machine with an LLM in it. It can inspect its own code and live state, then change how it works to fit your task, add new tools to save tokens, or work around bugs.")
 :prose
 ("Autolith creates new definitions or updates old ones, installs the diff, and runs required checks. If checks pass, the self-modifications can be saved." (:br nil) (:br nil) "The same runtime contains the agent, its tools, commands, and configuration. We do not need a plugin service or restarts.. But we will have plugins soon, don't worry")
 :prose-2
 ("Autolith can also operate its built-in SBCL debugger to fix errors it may cause, and reboots into a pristine recovery core for diagnosis and optionally repair if it hard-crashes."))
