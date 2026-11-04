;; Copy for the yours section. Inline markup: (:em () "text").
(:title
 ("Change anything about AL " (:em nil "from the prompt."))
 :lede
 (" Configure AL through files or Lisp forms, with help from the running agent.")
 :paragraph
 ("Use standard " (:code nil "SKILL.md") " files with frontmatter, or the native " (:code nil "SKILL.sexp") " format. Native skills can load modifications into the AL image, so review them before use." (:br nil) (:br nil) "Project skills take precedence over user skills with the same name. AL also finds skills in the shared " (:code nil "~/.agents/skills") " directory. Executable skills run tested Lisp workflows in a disposable worker.")
 :paragraph-2
 ("Connect MCP servers over stdio or Streamable HTTP, with a per-server approval policy. Project-defined servers load when the project is marked trusted in " (:code nil "directory-scopes.sexp") ".")
 :paragraph-3
 ("Seven predefined child roles are available: " (:strong nil "scout, designer, reviewer, librarian, task, engineering, sonic") " (GOTTA GO FAST). You can add your own to " (:code nil ".autolith/agents/") " and choose each role's tools, model, and reasoning effort.")
 :paragraph-4
 ("Ten providers are built in, including GitHub Copilot subscriptions. You can configure additional OpenAI-compatible endpoints.")
 :paragraph-5
 ("Load Lisp code at startup to set defaults, add commands, or modify the agent.")
 :paragraph-6
 ((:code nil "define-context-contributor") " adds temporary context to provider requests. These ephemeral notes " (:strong nil "erode") " as they age, without rewriting the conversation history. Context rules add guidance only when a path, language, tool, or role matches.")
 :paragraph-7
 ((:code nil "define-application-command") " defines a command as a Common Lisp function with metadata for help and completion. Test it by hand or ask AL to help debug it. Add small commands like " (:strong nil "pebbles") " on a beach.")
 :paragraph-9
 ("Settings have types and documentation. " (:code nil "(settings)") " opens a grouped page where you change values in place, and " (:code nil "(setf (config :model) ...)") " does the same from Lisp.")
 :paragraph-10
 ((:code nil "(help)") " gives a compact overview by topic, and " (:code nil "(help \"resource.edit\")") " explains any command, operation, or tool from its live schema.")
 :paragraph-8
 ((:code nil "AGENTS.md") " supplies project instructions. AL can also create AUTOLITH.org for project-specific adaptations that other agents do not need to load."))
