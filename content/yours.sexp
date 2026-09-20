;; Copy for the yours section. Inline markup: (:em () "text").
(:title
 ("Change anything about AL " (:em nil "from the prompt."))
 :lede
 (" Configuration is files and Lisp forms, and the running agent can help you with both.")
 :paragraph
 ("We support standard " (:code nil "SKILL.md") " with frontmatter, or native " (:code nil "SKILL.sexp") " format, which can also load modifications into the AL image on load (so audit your skills before use)." (:br nil) (:br nil) "Project skills take precedence over user's skills, if there's a conflict.")
 :paragraph-2
 ("Both stdio and streamable HTTP are supported, with a per-server approval policy. A project can have its own addition MCP servers defined and loaded if marked as trusted in " (:code nil "directory-scopes.sexp") ".")
 :paragraph-3
 ("Six predefined child roles are available: " (:strong nil "scout, designer, reviewer, librarian, task, sonic") " (GOTTA GO FAST). You can add your own to " (:code nil ".autolith/agents/") " and define tools, models, and efforts the role is assigned by default.")
 :paragraph-4
 ("Nine providers are built-in, see below, and other OpenAI-compatible providers are trivial to add.")
 :paragraph-5
 ("Your entrypoint to scripts being loaded on launch to change any settings to your preferences, or modify Autolith in any way you like.")
 :paragraph-6
 ((:code nil "define-context-contributor") " attaches what we call ephemeral notes to provider requests. You can use this to give the model temporary additional context to steer it better. They will quickly " (:strong nil "erode") " in a way that does not bust your whole cache.")
 :paragraph-7
 ((:code nil "define-application-command") " is a simple macro that lets you add your own commands that affect the harness the agent, or well, anything else in your system. The result will be a plain Common Lisp function with some metadata, so you can easily test it by hand and ask AL to help you debug it. Adding commands is cheap, you can litter them like small " (:strong nil "pebbles") " on the beach.")
 :paragraph-8
 ((:code nil "AGENTS.md") ", no surprises here. Autolith can also create AUTOLITH.org, where it can track information that's specific to it and should not confuse other agents you might use."))
