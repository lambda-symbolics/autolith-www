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
                 (:file "live") (:file "missions")
                 (:file "tasks") (:file "knowledge") (:file "cost")
                 (:file "security") (:file "state")
                 (:file "yours") (:file "install") (:file "friends")
                 (:file "footer")))
   (:file "src/page")
   (:file "src/og")
   (:file "src/build")))

(asdf:defsystem "autolith-www/edit"
  :description "A local server for editing site copy in place."
  :version "1.0.0"
  :depends-on ("autolith-www" "bordeaux-threads" "hunchentoot")
  :serial t
  :components
  ((:file "src/edit/printer")
   (:file "src/edit/markup")
   (:file "src/edit/panel")
   (:file "src/edit/server")))
