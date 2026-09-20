(in-package #:autolith-www)

;;;; -- The editing server --

;;; A development tool. It renders the site from the working tree on every
;;; request and writes edits straight back to CONTENT/, so nothing it produces
;;; takes part in the static build.

(defclass edit-acceptor (hunchentoot:acceptor)
  ((dispatchers :initarg :dispatchers
                :reader edit-acceptor-dispatchers
                :documentation "Request dispatchers tried in order."))
  (:documentation "An HTTP acceptor serving the editable page and copy saves."))

(defparameter *edit-port* 7777
  "The loopback port the editing server listens on by default.")

(defvar *edit-acceptor* nil
  "The running editing server, so a reload can replace it rather than duplicate it.")

(defmethod hunchentoot:acceptor-dispatch-request ((acceptor edit-acceptor) request)
  "Try each dispatcher in order, falling back to Hunchentoot's own handling."
  (loop for dispatcher in (edit-acceptor-dispatchers acceptor)
        for handler = (funcall dispatcher request)
        when handler
          return (funcall handler)
        finally (return (call-next-method))))

;;; Rendering

(defun edit--rendered-keys ()
  "Render the page once to learn which copy keys it shows in place.

Requires *EDIT-MODE*. The result feeds the panel that covers the remainder."
  (let ((*edit-rendered-keys* nil)
        (*edit-panel* nil))
    (render-to-string (site-page))
    *edit-rendered-keys*))

(defun edit--render ()
  "Render the editable page from the copy files as they stand on disk."
  (content-load)
  (let* ((*edit-mode* t)
         (rendered (edit--rendered-keys))
         (*edit-panel* (lambda () (edit-panel rendered)))
         (*edit-rendered-keys* nil))
    (render-to-string (site-page))))

;;; Handlers

(defun edit--page ()
  "Serve the editable page, never cached, so a reload shows the current files."
  (setf (hunchentoot:content-type*) "text/html; charset=utf-8")
  (setf (hunchentoot:header-out ':cache-control) "no-store")
  (edit--render))

(defun edit--refuse (condition)
  "Report a rejected save. The copy files are left as they were."
  (setf (hunchentoot:return-code*) hunchentoot:+http-bad-request+)
  (princ-to-string condition))

(defun edit--save ()
  "Write one posted copy value back to its file and reload the site copy."
  (setf (hunchentoot:content-type*) "text/plain; charset=utf-8")
  (let ((designator (hunchentoot:post-parameter "copy"))
        (value (hunchentoot:post-parameter "value")))
    (handler-case
        (cond
          ((not (and designator value))
           (setf (hunchentoot:return-code*) hunchentoot:+http-bad-request+)
           "Expected a copy designator and a value.")
          (t
           (copy-save designator value)
           (format nil "Saved ~a." designator)))
      (content-error (condition)
        (edit--refuse condition))
      (copy-write-error (condition)
        (edit--refuse condition)))))

;;; Dispatch

(defun edit--index-dispatcher (handler)
  "Dispatch the page itself without shadowing the asset paths beneath it."
  (lambda (request)
    (and (member (hunchentoot:request-method request) '(:get :head))
         (string= (hunchentoot:script-name request) "/")
         handler)))

(defun edit--save-dispatcher (handler)
  "Dispatch copy saves, which are posted and never cached."
  (lambda (request)
    (and (eq (hunchentoot:request-method request) ':post)
         (string= (hunchentoot:script-name request) "/copy")
         handler)))

(defun edit--dispatchers ()
  "Build the dispatch order: the page, copy saves, then the public asset tree."
  (list (edit--index-dispatcher 'edit--page)
        (edit--save-dispatcher 'edit--save)
        (hunchentoot:create-folder-dispatcher-and-handler
         "/" (merge-pathnames "public/" *site-root*))))

;;; Lifecycle

(defun edit-server-start (&key (port *edit-port*) (address "127.0.0.1"))
  "Start the copy editor on a loopback address, replacing any running server.

Returns the acceptor. The address defaults to 127.0.0.1 because the server
writes to the working tree and performs no authentication."
  (edit-server-stop)
  (content-load)
  (let ((acceptor (make-instance 'edit-acceptor
                                 :address address
                                 :port port
                                 :dispatchers (edit--dispatchers))))
    (hunchentoot:start acceptor)
    (setf *edit-acceptor* acceptor)))

(defun edit-server-stop ()
  "Stop the running editing server, if there is one."
  (when *edit-acceptor*
    (hunchentoot:stop *edit-acceptor*)
    (setf *edit-acceptor* nil))
  t)
