;; Copy for the install section. Inline markup: (:em () "text").
(:title
 ("Install it.")
 :prose
  ("Run the complete runtime with Nix, the preferred installation method where available.")
 :prose-2
 ("Installs or updates the packaged release for your platform. Then run " (:code nil "autolith") ".")
 :prose-3
  ("Install from PowerShell, then run " (:code nil "autolith") ".")
 :code__cap
 ("Then sign in to a provider")
 :prose-4
  ("Choose a provider and authenticate, then run " (:code nil "autolith") ". Type a request to begin.")
 :win__bar
  ("Platforms and updates")
 :paragraph
 ("ISC")
 :paragraph-2
 ("x86_64 and aarch64, glibc and static musl")
 :paragraph-3
 ("x86_64 and arm64")
 :paragraph-4
 ("FreeBSD, NetBSD, OpenBSD on x86_64")
 :paragraph-5
 ("x86_64")
 :paragraph-6
 ((:code nil "(update)") " inside AL, " (:code nil "autolith update") " from the CLI")
 :warn
  ((:span (:class "mark" :aria-hidden "true")) " Inspect the " (:a (:href "https://sh.lambda-symbolics.com/autolith" :class "ulink") "installer script") " before piping it into a shell. For setup, permissions, and source builds, read the " (:a (:href "https://lambda-symbolics.com/autolith/docs" :class "ulink") "guide") "."))
