;; Copy for security. Text and inline HSX-compatible markup.
(:title
 ("Every command is " (:em nil "classified") " before it runs.")
:lede
 ("External commands pass through authorization checks before execution. Process isolation and scoped filesystem access limit accidental damage; they are not a hostile-code security boundary.")
:paragraph
 (" " (:code nil "cl-exec-sandbox")
  " selects the backend: Bubblewrap on Linux, Seatbelt on macOS. The default policy gives a command no network, a read-only host, writes in the workspace and temporary directories, protected repository metadata, and sixty seconds. On Linux it adds process, user, IPC, UTS, and network namespaces, "
  (:code nil "no_new_privs") ", and seccomp. ")
:paragraph-2
 (" In automatic mode one bounded inference frame judges each command under a two-call, eight-thousand-token budget and answers through a closed schema: sandboxed, full access, or denied. It reads the command as data and ignores instructions written inside it. A failed classification denies. An unavailable sandbox turns a sandboxed verdict into a denial. ")
:paragraph-3
 (" Once, always for this exact command in this directory, sandboxed for the session, full access for the session, or denied. Headless jobs deny anything that would otherwise open the picker. ")
:paragraph-4
 (" OAuth and MCP credentials render as explicit redaction markers. Crash capsules are written secret-free. A checkpoint clears credentials from memory before it forks. An exported archive carries user data. ")
:paragraph-5
 (" Sixteen identical tool calls. Five hundred and twelve provider requests per turn. Sixty-four kilobytes of shell output, four mebibytes per file read, sixty-four kilobytes per crash capsule. Call, token, and depth budgets on every inference frame. ")
:paragraph-6
 (" A read returns an opaque revision. An edit applies against that exact observation, or it fails and names the revision it expected and the one it found. ")
:paragraph-7
 (" " (:code nil "--immutable")
  " pins the agent to one state: no evaluation, mutation, persistence, checkpoints, or rollback. Use it when you are integrating a fixed Autolith into something else, or running it unattended, and self-modification is not wanted. ")
)
