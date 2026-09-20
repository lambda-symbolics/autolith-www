(require :asdf)

;;; Hunchentoot's TLS support is irrelevant to a loopback editing server and
;;; would pull in a foreign-library dependency, so it is disabled before the
;;; system definition is read.
(pushnew :hunchentoot-no-ssl *features*)

(let ((root (uiop:pathname-parent-directory-pathname
             (uiop:pathname-directory-pathname *load-truename*))))
  (asdf:initialize-source-registry
   `(:source-registry (:directory ,root)
     (:tree ,(merge-pathnames "vendor/" root)) :ignore-inherited-configuration))
  (asdf:initialize-output-translations
   '(:output-translations :enable-user-cache :ignore-inherited-configuration))
  (let ((*compile-verbose* nil) (*load-verbose* nil))
    (asdf:load-system "autolith-www/edit"))
  (let* ((argument (first (uiop:command-line-arguments)))
         (port (if argument (parse-integer argument) 7777)))
    (uiop:symbol-call :autolith-www :edit-server-start :port port)
    (format t "Editing http://127.0.0.1:~d/ . Press Ctrl-C to stop.~%" port)
    (finish-output))
  (handler-case (loop (sleep 3600))
    (sb-sys:interactive-interrupt ()
      (uiop:symbol-call :autolith-www :edit-server-stop)
      (format t "~&Stopped.~%"))))
