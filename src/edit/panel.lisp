(in-package #:autolith-www)

;;;; -- The panel for copy without an in-page position --

;;; Page metadata, canonical links and installation commands reach the browser
;;; as attributes or as text the page assembles, so they have no node to click.
;;; Membership is derived from a first render rather than listed by hand.

(defun edit--plain-text (value)
  "Return VALUE as plain text, or NIL when it carries inline markup."
  (when (every #'stringp value)
    (format nil "~{~a~}" value)))

(defun edit--value-source (value)
  "Print a copy value as the sexp text the editor posts back."
  (with-output-to-string (stream)
    (write-char #\( stream)
    (loop for node in value
          for leading = t then nil
          do (unless leading
               (write-char #\Space stream))
             (copy--print-node node stream))
    (write-char #\) stream)))

(defun edit--unplaced-keys (rendered)
  "List (section key value) for every copy key absent from the rendered page."
  (let ((sections (sort (loop for section being the hash-keys of *content*
                              collect section)
                        #'string< :key #'symbol-name)))
    (loop for section in sections
          append (loop for (key value) on (gethash section *content*) by #'cddr
                       unless (member (cons section key) rendered :test #'equal)
                         collect (list section key value)))))

(defun edit--field (section key value)
  "Render one panel field, as text where possible and as sexp otherwise."
  (let* ((text (edit--plain-text value))
         (source (or text (edit--value-source value)))
         (designator (content-designator section key))
         (form (if text "text" "sexp"))
         (multiline (or (null text)
                        (find #\Newline source)
                        (> (length source) 72))))
    (hsx
      (label :class "edit-panel__field"
        (span :class "edit-panel__name" designator)
        (if multiline
            (hsx (textarea :class "edit-panel__input" :rows "3"
                           :data-edit designator :data-edit-form form
                           source))
            (hsx (input :class "edit-panel__input" :type "text" :value source
                        :data-edit designator :data-edit-form form)))))))

(defun edit-panel (rendered)
  "Render the editing panel for copy the page does not show in place."
  (let ((fields (mapcar (lambda (entry) (apply #'edit--field entry))
                        (edit--unplaced-keys rendered))))
    (hsx
      (aside :class "edit-panel"
        (details :class "edit-panel__box"
          (summary :class "edit-panel__summary" "Copy without an in-page position")
          (div :class "edit-panel__fields" fields))))))
