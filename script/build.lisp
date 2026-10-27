(require :asdf)

(let ((root (uiop:pathname-parent-directory-pathname
             (uiop:pathname-directory-pathname *load-truename*))))
  (load (merge-pathnames "script/setup.lisp" root))
  (asdf:initialize-output-translations
   '(:output-translations :enable-user-cache :ignore-inherited-configuration))
  (let ((*compile-verbose* nil) (*load-verbose* nil))
    (asdf:load-system "autolith-www"))
  (uiop:symbol-call :autolith-www :site-build
                    :og-card-p (and (member "--og-card" (uiop:command-line-arguments)
                                            :test #'equal)
                                    t))
  (when (member "--test" (uiop:command-line-arguments) :test #'equal)
    (load (merge-pathnames "tests/content.lisp" root))))
