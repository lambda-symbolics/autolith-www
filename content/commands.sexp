;; Shared installation commands. Rendered text and clipboard values use these keys.
(:nix ("nix run github:lambda-symbolics/autolith")
 :binary ("curl -fsSL https://sh.lambda-symbolics.com/autolith | sh")
 :windows ("irm https://sh.lambda-symbolics.com/autolith.ps1 | iex"))
