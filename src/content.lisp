(in-package #:autolith-www)

(defvar *content* (make-hash-table :test #'eq)
  "Section names mapped to validated copy property lists.")

(defparameter *edit-mode* nil
  "True while the editing server renders a page, never during a static build.")

(defparameter *edit-rendered-keys* nil
  "Copy fragments rendered in place, collected as (section . key) while editing.")

(define-condition content-error (error)
  ((location :initarg :location :reader content-error-location
             :documentation "The file or key that could not be read.")
   (detail :initarg :detail :reader content-error-detail
           :documentation "The validation failure."))
  (:documentation "Invalid or missing site copy.")
  (:report (lambda (condition stream)
             (format stream "Invalid content at ~a: ~a"
                     (content-error-location condition)
                     (content-error-detail condition)))))

(defun content--fail (location detail)
  "Signal a content failure with its source location."
  (error 'content-error :location location :detail detail))

(defun content--validate-node (node location)
  "Accept text and a small inline vocabulary, never executable forms or raw HTML."
  (unless
      (or (stringp node)
          (and (consp node)
               (member (first node) '(:em :strong :b :i :code :kbd :span :a :br))
               (listp (second node))
               (evenp (length (second node)))
               (loop for (key value) on (second node) by #'cddr
                     always (and (member key '(:href :class :aria-hidden))
                                 (stringp value)
                                 (or (not (eq key ':href))
                                     (uiop:string-prefix-p "https://" value)
                                     (uiop:string-prefix-p "#" value))))
               (listp (rest (rest node)))
               (every (lambda (child)
                        (content--validate-node child location))
                      (rest (rest node)))))
    (content--fail location "Expected text or supported inline markup."))
  t)

(defun content-read (path)
  "Read exactly one keyword property list with reader evaluation disabled."
  (handler-case
      (with-open-file (stream path :external-format :utf-8)
        (let* ((*read-eval* nil)
               (data (read stream nil ':eof))
               (seen nil))
          (unless (and (listp data) (evenp (length data))
                       (eq (read stream nil ':eof) ':eof))
            (content--fail path "Expected one property list."))
          (loop for (key value) on data by #'cddr do
            (unless (and (keywordp key) (not (member key seen)) (listp value))
              (content--fail path "Expected unique keyword keys and lists of text."))
            (push key seen)
            (mapc (lambda (node) (content--validate-node node path)) value))
          data))
    (content-error (condition) (error condition))
    (error (condition) (content--fail path (princ-to-string condition)))))

(defun content-load ()
  "Reload editable copy from CONTENT/ for this build."
  (let ((table (make-hash-table :test #'eq)))
    (dolist (path (directory (merge-pathnames "content/*.sexp" *site-root*)))
      (setf (gethash (intern (string-upcase (pathname-name path)) :keyword) table)
            (content-read path)))
    (setf *content* table)))

(defun content--element (node)
  "Convert a validated inline node into an HSX element."
  (if (stringp node)
      node
      (hsx/element:create-element
       (first node) (second node)
       (mapcar #'content--element (rest (rest node))))))

(defun content-nodes (section key)
  "Render one named copy fragment, failing the build for a missing key."
  (let* ((missing (gensym))
         (value (getf (gethash section *content*) key missing)))
    (when (eq value missing)
      (content--fail (list section key) "No such copy key."))
    (mapcar #'content--element value)))

(defun content-designator (section key)
  "Name one copy fragment for the editor, as in \"hero:hero__lede\"."
  (string-downcase (format nil "~a:~a" (symbol-name section) (symbol-name key))))

(defun content (section key)
  "Render one copy fragment, wrapped in an editable marker while editing."
  (let ((nodes (content-nodes section key)))
    (if (not *edit-mode*)
        nodes
        (progn
          (pushnew (cons section key) *edit-rendered-keys* :test #'equal)
          (hsx/element:create-element
           ':span (list ':class "edit-field"
                        ':data-edit (content-designator section key))
           nodes)))))
