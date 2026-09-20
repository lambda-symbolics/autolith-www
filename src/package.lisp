(defpackage #:autolith-www
  (:use #:cl)
  (:import-from #:hsx #:hsx #:defcomp #:render-to-string)
  (:export #:site-build
           #:edit-server-start
           #:edit-server-stop))

(in-package #:autolith-www)

(hsx:register-web-components svg g path)

(defparameter *site-root* (asdf:system-source-directory "autolith-www")
  "Root of the source checkout, including content and public assets.")
