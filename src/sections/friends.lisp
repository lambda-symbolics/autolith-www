(in-package #:autolith-www)

(defcomp ~section-friends nil
  "Render the friends section: a card for Chakany Systems, who contribute to Autolith."
  (hsx
    (section :class "band band--short" :id "friends" :aria-labelledby "friends-title"
      (div :class "wrap wrap--wide"
        (article :class "win shadowband friend" :data-rv "fade"
          (h2 :class "win__bar" :id "friends-title"
            (content ':friends ':win__bar))
          (div :class "win__body friend__body"
            (a :class "friend__logo" :href "https://chakany.systems/"
              (raw! (site-inline-svg "logo/chakany-systems.svg")))
            (div :class "friend__copy"
              (p
                (content ':friends ':paragraph))
              (p
                (content ':friends ':paragraph-2))
              (p :class "friend__link"
                (content ':friends ':link)))))))))
