(in-package #:autolith-www)

(defun test-content-failure (text)
  "Check rejection of malformed or executable copy without evaluating it."
  (let ((path (merge-pathnames ".cache/test-content.sexp" *site-root*)))
    (unwind-protect
         (progn
           (with-open-file (out path :direction :output :if-exists :supersede)
             (write-string text out))
           (assert (handler-case (progn (content-read path) nil)
                     (content-error () t))))
      (when (probe-file path) (delete-file path)))))

(dolist (text '("#.(error \"executed\")" "(:title (\"x\") :title (\"y\"))"
                "(:title ((:script () \"bad\")))"
                "(:title ((:a (:href \"javascript:alert(1)\") \"bad\")))"
                "(:title ((:em (:onclick \"bad\") \"x\")))"
                "(:title (\"x\")) (:extra (\"y\"))" "(:title"))
  (test-content-failure text))

(let ((*content* (make-hash-table :test #'eq)))
  (assert (handler-case (progn (content ':missing ':title) nil)
            (content-error () t)))
  (setf (gethash ':test *content*) '(:title ("<script>&\"")))
  (assert (equal (render-to-string (hsx (p (content ':test ':title))))
                 "<p>&lt;script&gt;&amp;&quot;</p>")))

(let ((before (uiop:read-file-string (merge-pathnames "dist/index.html" *site-root*))))
  (site-build)
  (assert (equal before (uiop:read-file-string (merge-pathnames "dist/index.html" *site-root*))))
  (dolist (method '(:nix :binary :source :windows))
    (let ((command (content-text ':commands method)))
      (assert (search (hsx/utils:escape-html-text-content command) before)))))
(format t "Content validation, escaping and deterministic build checks passed.~%")
