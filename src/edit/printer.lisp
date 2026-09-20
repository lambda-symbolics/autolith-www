(in-package #:autolith-www)

;;;; -- Copy files on disk --

(defvar *copy-lock* (bordeaux-threads:make-lock "autolith-www copy files")
  "Serializes the read, replace and write cycle against concurrent saves.")

(define-condition copy-write-error (error)
  ((path :initarg :path :reader copy-write-error-path
         :documentation "The copy file that could not be rewritten.")
   (detail :initarg :detail :reader copy-write-error-detail
           :documentation "The reason the rewrite was refused."))
  (:documentation "A copy file could not be rewritten from the editor.")
  (:report (lambda (condition stream)
             (format stream "Cannot write ~a: ~a"
                     (copy-write-error-path condition)
                     (copy-write-error-detail condition)))))

;;; Locating files

(defun copy-path (section)
  "Locate the copy file backing one loaded section."
  (unless (nth-value 1 (gethash section *content*))
    (error 'copy-write-error :path section :detail "No such copy section."))
  (let ((path (merge-pathnames (format nil "content/~a.sexp" (string-downcase section))
                               *site-root*)))
    (unless (probe-file path)
      (error 'copy-write-error :path path :detail "No such copy file."))
    path))

(defun copy--header (path)
  "Return the leading comment lines of a copy file, verbatim and in order."
  (with-open-file (stream path :external-format :utf-8)
    (loop for line = (read-line stream nil nil)
          while (and line (uiop:string-prefix-p ";" (string-left-trim " " line)))
          collect line)))

;;; Printing the copy vocabulary

(defun copy--print-keyword (keyword stream)
  "Print a keyword the way the copy files spell it, colon included."
  (format stream ":~a" (string-downcase (symbol-name keyword))))

(defun copy--print-string (string stream)
  "Print a copy string as a readable Lisp literal."
  (write-char #\" stream)
  (loop for character across string
        do (when (or (char= character #\") (char= character #\\))
             (write-char #\\ stream))
           (write-char character stream))
  (write-char #\" stream))

(defun copy--print-attributes (attributes stream)
  "Print an inline element's attribute list, using NIL when it is empty."
  (cond
    ((null attributes)
     (write-string "nil" stream))
    (t
     (write-char #\( stream)
     (loop for (key value) on attributes by #'cddr
           for leading = t then nil
           do (unless leading
                (write-char #\Space stream))
              (copy--print-keyword key stream)
              (write-char #\Space stream)
              (copy--print-string value stream))
     (write-char #\) stream))))

(defun copy--print-node (node stream)
  "Print one validated inline node, either text or a marked-up element."
  (cond
    ((stringp node)
     (copy--print-string node stream))
    (t
     (write-char #\( stream)
     (copy--print-keyword (first node) stream)
     (write-char #\Space stream)
     (copy--print-attributes (second node) stream)
     (dolist (child (rest (rest node)))
       (write-char #\Space stream)
       (copy--print-node child stream))
     (write-char #\) stream))))

(defun copy--print-entry (key value)
  "Render one key and its value list as the lines they occupy in a copy file."
  (with-output-to-string (stream)
    (copy--print-keyword key stream)
    (format stream "~% (")
    (loop for node in value
          for leading = t then nil
          do (unless leading
               (write-char #\Space stream))
             (copy--print-node node stream))
    (write-char #\) stream)))

(defun copy--print-plist (plist stream)
  "Print a copy property list, one key per line with its value list beneath it."
  (format stream "(~{~a~^~% ~})~%"
          (loop for (key value) on plist by #'cddr
                collect (copy--print-entry key value))))

;;; Rewriting files

(defun copy-write (section plist)
  "Rewrite one section's copy file, preserving its leading comment lines.

The new text is written beside the file and renamed over it, so a reader
never observes a half-written copy file."
  (let ((path (copy-path section)))
    (unless (and plist (listp plist) (evenp (length plist)))
      (error 'copy-write-error :path path :detail "Expected a non-empty property list."))
    (let ((header (copy--header path))
          (staging (make-pathname :type "sexp-writing" :defaults path)))
      (with-open-file (stream staging :direction :output :if-exists :supersede
                                      :external-format :utf-8)
        (dolist (line header)
          (write-line line stream))
        (copy--print-plist plist stream))
      (rename-file staging path))
    path))
