;; Copy for the mutation section. Inline markup: (:em () "text").
(:title
 ("Self-modifying and " (:em nil "adaptable"))
 :lede
 ("Autolith is a flexible computing environment (like Emacs or a Lisp machine) with an LLM inside. The LLM can examine and modify its own code and state to adapt to your tasks and needs, to create new tools (saving tokens), or work around bugs.")
 :prose
 ("To do this, Autolith creates new definitions or patches, installs the diff, and runs checks to validate the change. If the checks pass, these self-modifications can be saved." (:br nil) (:br nil) "The agent, its tools, its commands, and its configuration all run in the same runtime. No need for a plugin management or restarts. (But we will have plugins soon, don't worry)")
 :prose-2
 ("Autolith can also control the built-in SBCL debugger to recover from errors it makes. If it hard-crashes, it can boot a minimal recovery core for diagnosis and repair."))
