;; Copy for the install section. Inline markup: (:em () "text").
(:title
 ("Install it.")
:prose
 ("The high testosterone, high estrogen way to install Autolith.")
:prose-2
 ("Installs or updates the packaged release for your platform. Then run "
  (:code nil "autolith") ".")
:prose-3
 ("Windows gets packaged binaries from 0.50.0. A source checkout still works through "
  (:code nil "script\\bootstrap.ps1") ".")
:code__cap
 ("Then sign in to a provider")
:prose-4
 (" A web flow or an API key, whichever the provider offers. One is enough. Then run "
  (:code nil "autolith") ". ")
:win__bar
 ("Autolith 0.50.0")
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
 ((:code nil "(update)") " inside, " (:code nil "autolith update") " outside")
:warn
 (" " (:span (:class "mark" :aria-hidden "true"))
  " Yes, piping a URL into a shell is evil. Read the installer first. Nix is the preferred installation method on worthy operating systems. ")
)
