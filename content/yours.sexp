;; Copy for the yours section. Inline markup: (:em () "text").
(:title
 ("Change anything about AL " (:em nil "from the prompt."))
 :lede
 (" Configuration is files and Lisp forms, and the running agent can help you with both.")
 :paragraph
 ("We support standard " (:code nil "SKILL.md") " with frontmatter, or native " (:code nil "SKILL.sexp") " format, which can also load modifications into the AL image on load (so audit your skills before use)." (:br nil) (:br nil) "Project skills take precedence over user's skills, if there's a conflict. Skills in the shared " (:code nil "~/.agents/skills") " directory are found too, and executable skills run tested Lisp workflows in a disposable worker.")
 :paragraph-2
 ("Both stdio and streamable HTTP are supported, with a per-server approval policy. A project can have its own addition MCP servers defined and loaded if marked as trusted in " (:code nil "directory-scopes.sexp") ".")
 :paragraph-3
 ("Seven predefined child roles are available: " (:strong nil "scout, designer, reviewer, librarian, task, engineering, sonic") " (GOTTA GO FAST). You can add your own to " (:code nil ".autolith/agents/") " and define tools, models, and efforts the role is assigned by default.")
 :paragraph-4
 ("Ten providers are built in, including GitHub Copilot subscriptions, and other OpenAI-compatible providers are trivial to add.")
 :paragraph-5
 ("Your entrypoint to scripts being loaded on launch to change any settings to your preferences, or modify Autolith in any way you like.")
 :paragraph-6
 ((:code nil "define-context-contributor") " attaches what we call ephemeral notes to provider requests. You can use this to give the model temporary additional context to steer it better. They will quickly " (:strong nil "erode") " in a way that does not bust your whole cache. Context rules attach notes only when a path, language, tool, or role matches.")
 :paragraph-7
 ((:code nil "define-application-command") " is a simple macro that lets you add your own commands that affect the harness the agent, or well, anything else in your system. The result will be a plain Common Lisp function with some metadata, so you can easily test it by hand and ask AL to help you debug it. Adding commands is cheap, you can litter them like small " (:strong nil "pebbles") " on the beach.")
 :paragraph-9
 ("Every knob is a typed, documented setting. " (:code nil "(settings)") " opens a grouped page where you change values in place, and " (:code nil "(setf (config :model) ...)") " does the same from Lisp.")
 :paragraph-10
 ((:code nil "(help)") " gives a compact overview by topic, and " (:code nil "(help \"resource.edit\")") " explains any command, operation, or tool from its live schema.")
 :paragraph-8
 ((:code nil "AGENTS.md") ", no surprises here. Autolith can also create AUTOLITH.org, where it can track information that's specific to it and should not confuse other agents you might use."))
