;; Tools, integrations, and optional runtime extension.
(:title
 ("Make it fit " (:em nil "your work."))
 :lede
 ("Use the tools already in Autolith, connect the software you rely on, or ask the agent to add a capability. Configure it in files or extend the live runtime from the prompt.")
 :tools
 ("Work with files, processes, services, and disposable Lisp workers. Commands, tool calls, and Lisp evaluation share the same runtime and live documentation.")
 :skills
 ("Load task-specific instructions from standard SKILL.md files or native SKILL.sexp skills. Executable skills can package tested Lisp workflows.")
 :mcp
 ("Connect external tools and resources over stdio or Streamable HTTP, with per-server approval policies.")
 :editors
 ("Use Autolith from an editor through the Agent Client Protocol with " (:code nil "autolith acp") ". Stream answers, tool activity, approvals, and steering into the same session.")
 :providers
 ("Use subscription sign-ins, API keys, or local Google Cloud credentials. Choose among built-in providers or configure an OpenAI-compatible endpoint.")
 :runtime
 ("Load startup code in init.lisp, add commands, or define request-local context. Ask Autolith to inspect and explain an extension before keeping it.")
 :note
 ("Commands require authorization, and file edits require an observed revision. Choose permission policies for unattended work explicitly. Process isolation contains accidents; it does not make hostile code safe."))
