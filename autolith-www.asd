(asdf:defsystem "autolith-www"
  :description "Autolith's static site, generated with HSX."
  :version "1.0.0"
  :depends-on ("hsx")
  :serial t
  :components
  ((:file "src/package")
   (:file "src/content")
   (:file "src/components")
   (:module "src/sections"
    :serial t
    :components ((:file "hero") (:file "image") (:file "repl")
                 (:file "mutation") (:file "context") (:file "sessions")
                 (:file "live") (:file "security") (:file "state")
                 (:file "yours") (:file "install") (:file "footer")))
   (:file "src/page")
   (:file "src/build")))
