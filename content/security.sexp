;; Copy for security. Text and inline HSX-compatible markup.
(:title
 ("Sandboxing and security.")
 :lede
 ("Commands go through authorization before execution." (:br nil) (:br nil) "Process isolation and scoped filesystem access limit accidental damage. This is not a security boundary for hostile code.")
 :paragraph
 (" " (:code nil "cl-exec-sandbox") " provides sandboxing on Linux, macOS, and Windows." (:br nil) (:br nil) "By default, commands have no network access, read-only host access, write access to the workspace and temporary directories, and a sixty-second timeout. Repository metadata is protected from writes." (:br nil) (:br nil) "On Linux it adds process, user, IPC, UTS, and network namespaces, " (:code nil "no_new_privs") ", and seccomp. ")
 :paragraph-2
 (" In automatic mode one RLM inference frame judges each command under a two-call, eight-thousand-token budget and answers: sandboxed, full access, or denied.")
 :paragraph-3
 ("For each command, choose " (:strong nil "approve once, run sandboxed, full access, or deny") ". Headless jobs deny commands that would require an interactive decision, so choose their permission policy before starting them.")
 :paragraph-4
 ("Autolith redacts known credential fields in selected output paths, including MCP and OAuth credentials. Avoid putting secrets in prompts, source, or tool output.")
 :paragraph-5
 ("Configurable limits bound retries, repeated tool calls, and inference budgets.")
 :paragraph-6
 ("File edits require an observed revision. If the file changes after it was read, Autolith refuses the stale edit. Line hashes help check that an edit targets the intended text.")
 :paragraph-7
 (" " (:code nil "--immutable") " disables live self-modification operations." (:br nil) (:br nil) "Use it for a worker embedded in another program, or whenever you want to keep the running implementation fixed."))
