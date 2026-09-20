(in-package #:autolith-www)

;;;; -- Posted copy values --

;;; The editor serializes an edited region to the same vocabulary the copy
;;; files use, so browser input passes through the reader and the validator
;;; that already guard CONTENT/.

(defun copy-parse (text location)
  "Read a posted copy value as a list of validated inline nodes."
  (handler-case
      (with-input-from-string (stream text)
        (let* ((*read-eval* nil)
               (value (read stream nil ':eof)))
          (unless (and (listp value) (eq (read stream nil ':eof) ':eof))
            (content--fail location "Expected one list of inline nodes."))
          (mapc (lambda (node) (content--validate-node node location)) value)
          value))
    (content-error (condition)
      (error condition))
    (error (condition)
      (content--fail location (princ-to-string condition)))))

(defun copy-designator-parse (designator)
  "Split \"hero:hero__lede\" into its section and key, or signal a content error."
  (let ((colon (position #\: designator)))
    (unless (and colon (plusp colon) (< (1+ colon) (length designator)))
      (content--fail designator "Expected a section:key designator."))
    (values (intern (string-upcase (subseq designator 0 colon)) ':keyword)
            (intern (string-upcase (subseq designator (1+ colon))) ':keyword))))

(defun copy-save (designator text)
  "Replace one copy key from the editor, then reload the site copy.

Returns the rewritten file's pathname. Signals CONTENT-ERROR for unusable
markup and COPY-WRITE-ERROR for an unknown section, key or file."
  (multiple-value-bind (section key) (copy-designator-parse designator)
    (let ((nodes (copy-parse text designator)))
      (bordeaux-threads:with-lock-held (*copy-lock*)
        (let ((plist (content-read (copy-path section)))
              (missing (gensym)))
          (when (eq (getf plist key missing) missing)
            (error 'copy-write-error :path designator :detail "No such copy key."))
          (setf (getf plist key) nodes)
          (prog1 (copy-write section plist)
            (content-load)))))))
