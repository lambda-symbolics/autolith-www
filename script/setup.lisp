;;;; -- Site Dependencies --

;;; Make the site and its vendored dependencies the only systems ASDF finds.
;;; The build, the copy editor, and the source checks' clean compile load this
;;; file first.
;;;
;;; Hunchentoot's TLS support is irrelevant to a loopback editing server and
;;; would pull in a foreign-library dependency, so it is disabled before any
;;; system definition is read.

(require :asdf)
(pushnew :hunchentoot-no-ssl *features*)

(let ((root (uiop:pathname-parent-directory-pathname
             (uiop:pathname-directory-pathname *load-truename*))))
  (asdf:initialize-source-registry
   `(:source-registry (:directory ,root)
                      (:tree ,(merge-pathnames "vendor/" root))
                      :ignore-inherited-configuration)))
