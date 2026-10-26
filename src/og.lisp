(in-package #:autolith-www)

;;;; -- Social card --

;;; The Open Graph image is a screenshot of this page at 1200 by 630 pixels,
;;; taken by script/og, so it shares the site's copy, fonts and palette.

(defparameter *og-card-style*
  "html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:var(--paper)}
.card{box-sizing:border-box;width:1200px;height:630px;padding:72px 72px 64px;
  display:grid;grid-template-columns:1fr 480px;column-gap:8px;color:var(--ink)}
.card__copy{display:flex;flex-direction:column;justify-content:space-between;min-width:0}
.card__name{font-family:var(--serif);font-weight:700;font-size:150px;line-height:.9;
  letter-spacing:-.035em;margin:0}
.card__claim{font-family:var(--serif);font-weight:700;font-size:46px;line-height:1.08;
  letter-spacing:-.02em;margin:28px 0 0;max-width:640px}
.card__logo{width:230px;color:var(--ink)}
.card__logo svg{display:block;width:100%;height:auto}
.card__logo .ls-l{fill:var(--green)}
.card__art{align-self:end;justify-self:end;width:480px;height:auto;margin:0 -24px -10px 0}"
  "Layout of the social card on top of the site stylesheet.")

(defun site-og-card ()
  "Compose the 1200 by 630 social card from the hero copy, the mascot and the wordmark."
  (hsx
    (html :lang "en"
      (head
        (meta :charset "UTF-8")
        (title (content-text ':site ':title))
        (link :rel "stylesheet" :href "css/site.css")
        (style (raw! *og-card-style*)))
      (body
        (div :class "card"
          (div :class "card__copy"
            (div
              (h1 :class "card__name" (content ':hero ':hero__name))
              (p :class "card__claim" (content ':hero ':display)))
            (div :class "card__logo"
              (raw! (site-inline-svg "logo/ls-wordmark.svg"))))
          (img :class "card__art" :src "autolith.png" :alt ""))))))
