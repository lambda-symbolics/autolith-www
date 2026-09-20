(in-package #:autolith-www)

(defparameter *site-public-exclusions* '("edit")
  "Subdirectories of PUBLIC/ that serve development only and never reach DIST/.")

(defun site--copy-directory (source destination)
  "Copy the static asset tree without introducing build-time dependencies."
  (ensure-directories-exist destination)
  (dolist (file (uiop:directory-files source))
    (uiop:copy-file file (merge-pathnames (file-namestring file) destination)))
  (dolist (directory (uiop:subdirectories source))
    (let ((name (first (last (pathname-directory directory)))))
      (unless (member name *site-public-exclusions* :test #'string=)
        (site--copy-directory
         directory
         (merge-pathnames (make-pathname :directory (list ':relative name))
                          destination))))))

(defun site-build ()
  "Generate the complete static site into DIST/ after validating its copy."
  (let* ((start (get-internal-real-time))
         (output (merge-pathnames "dist/" *site-root*))
         (staging (merge-pathnames ".site-build/" *site-root*)))
    (content-load)
    (let ((html (render-to-string (site-page))))
      (when (probe-file staging)
        (uiop:delete-directory-tree staging :validate t))
      (unwind-protect
           (progn
             (site--copy-directory (merge-pathnames "public/" *site-root*) staging)
             (with-open-file (stream (merge-pathnames "index.html" staging)
                                     :direction :output :if-exists :supersede
                                     :external-format :utf-8)
               (write-string html stream)
               (terpri stream))
             (when (probe-file output)
               (uiop:delete-directory-tree output :validate t))
             (rename-file staging output))
        (when (probe-file staging)
          (uiop:delete-directory-tree staging :validate t))))
    (format t "Generated dist/ in ~,3f s.~%"
            (/ (- (get-internal-real-time) start) internal-time-units-per-second))))
