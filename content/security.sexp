;; Copy for security. Text and inline HSX-compatible markup.
(:title
 ("Sandboxing and security.")
 :lede
 ("Executed commands go through authorization checks before execution, just like in any solid agent." (:br nil) (:br nil) "We have a sandbox with process isolation and scoped filesystem access to limit accidental damage.")
 :paragraph
 (" " (:code nil "cl-exec-sandbox") " is our platform abstraction for sandboxing, which works on Linux, Mac and Windows." (:br nil) (:br nil) "The default policy is to give commands no network, a read-only host access, allow writing in the workspace and temp directories, forbid changing repo metadata, and a sixty seconds timeout." (:br nil) (:br nil) "On Linux it adds process, user, IPC, UTS, and network namespaces, " (:code nil "no_new_privs") ", and seccomp. ")
 :paragraph-2
 (" In automatic mode one RLM inference frame judges each command under a two-call, eight-thousand-token budget and answers: sandboxed, full access, or denied.")
 :paragraph-3
 ("You can select different permission levels: " (:strong nil "approve once, run sandboxed, full access, or denied") ". Headless jobs deny anything that would otherwise open the picker, so make sure to select the correct default setting. ")
 :paragraph-4
 ("In a number of places, Autolith will censor your credentials for MCPs, OAuth, tokens and similar.")
 :paragraph-5
 ("Most things have defined boundaries to prevent runaway doom loops and reckless spending. These things are of course configurable.")
 :paragraph-6
 ("We use careful hashline-based editing (similar to Pi agent), which ensures the agent correctly selects places to edit and does not clobber over forgotten changes.")
 :paragraph-7
 (" " (:code nil "--immutable") " prevents Autolith from self-modifying when you need maximum predictability and security." (:br nil) (:br nil) "You can use it when you are integrating Autolith into another program as a worker, or you just don't want self-modification."))
