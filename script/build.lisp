(require :asdf)

(let ((root (uiop:pathname-parent-directory-pathname
             (uiop:pathname-directory-pathname *load-truename*))))
  (asdf:initialize-source-registry
   `(:source-registry (:directory ,root)
     (:tree ,(merge-pathnames "vendor/" root)) :ignore-inherited-configuration))
  (asdf:initialize-output-translations
   '(:output-translations :enable-user-cache :ignore-inherited-configuration))
  (let ((*compile-verbose* nil) (*load-verbose* nil))
    (asdf:load-system "autolith-www"))
  (uiop:symbol-call :autolith-www :site-build)
  (when (member "--test" (uiop:command-line-arguments) :test #'equal)
    (load (merge-pathnames "tests/content.lisp" root))))
