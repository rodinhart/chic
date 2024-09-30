;; Vector ;;
∃ type Vec x, y, z

A ∈ Vec + B ∈ Vec ≡ Vec
  A.x + B.x
  A.y + B.y 
  A.z + B.z

A ∈ Vec × B ∈ Vec ≡ Vec
  A.y × B.z - A.z × B.y
  A.z × B.x - A.x × B.z
  A.x × B.y - A.y × B.x

∃ op · 3, infix, 16

A ∈ Vec · B ∈ Vec ≡
  A.x × B.x + A.y × B.y + A.z × B.z


;; Recursion test ;;
∃ op sum 2, 10

sum n ∈ Number a ∈ Number ≡
  { sum n - 1 a + n  if n > 0,
    a                otherwise }


;; Complex numbers ;;
∃ type Complex re, im
∃ op mag 1, 10

A ∈ Complex + B ∈ Complex ≡ Complex
  A.re + B.re
  A.im + B.im

A ∈ Complex × B ∈ Complex ≡ Complex
  A.re × B.re - A.im × B.im
  A.re × B.im + A.im × B.re

mag A ∈ Complex ≡ √(A.re × A.re + A.im × A.im)


;; Point ;;
∃ type Point x, y


;; Pixel ;;
∃ type Pixel x, y, col


;; Mandelbrot ;;
∃ op mandel_f 3, 10
mandel_f C ∈ Complex Z ∈ Complex n ∈ Number ≡
  { mandel_f C Z × Z + C n - 1  if n > 0 ∧ (mag Z) < 2,
    n                           otherwise }

∃ op mandel 4, 10
mandel x ∈ Number y ∈ Number s ∈ Number S ∈ Number ≡
  let q : s / S,
      O : Complex 0 0 in
  ∀ P let C : Complex x + q × P.x y + q × P.y in
      >> Pixel P.x P.y mandel_f C O 256
