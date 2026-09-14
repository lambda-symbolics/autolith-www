;; Copy for the yours section. Inline markup: (:em () "text").
(:title
 ("Change any layer " (:em nil "from the prompt."))
:lede
 (" Configuration is files and Lisp forms, and the running agent reads both. ")
:paragraph
 ("Standard " (:code nil "SKILL.md") " with frontmatter, or native "
  (:code nil "SKILL.sexp") ". Project skills win over yours, yours win over bundled.")
:paragraph-2
 ("Stdio or Streamable HTTP, with an approval policy per server. Trust a directory in "
  (:code nil "directory-scopes.sexp") " to let its own " (:code nil "mcp.sexp") " load.")
:paragraph-3
 ("Six bundled: scout, designer, reviewer, librarian, task, sonic. Write your own into "
  (:code nil ".autolith/agents/") " and name the tools, models, and effort each one gets.")
:paragraph-4
 ("Nine built in, from ChatGPT and Gemini subscriptions to Anthropic and Mistral keys. Register any other OpenAI-compatible endpoint from the REPL.")
:paragraph-5
 ("Ordinary Common Lisp in the " (:code nil "autolith")
  " package, loaded after tracked code and your selected private commit, with your privileges.")
:paragraph-6
 ((:code nil "define-context-contributor")
  " attaches bounded standing notes to provider requests. A note shapes one request.")
:paragraph-7
 ((:code nil "define-application-command")
  " adds your own. The thirty-seven built-in slash commands are sugar for the same Lisp calls.")
:paragraph-8
 ((:code nil "AGENTS.md")
  " at the project root, refined by deeper ones, re-read on every request.")
)
