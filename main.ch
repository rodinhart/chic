;; Core ;;
∃ type >> val


;; Vector ;;
∃ type Vec x, y, z

A ∈ Vec + B ∈ Vec ≡ Vec A.x + B.x  A.y + B.y  A.z + B.z

A ∈ Vec × B ∈ Vec ≡ Vec
  A.y × B.z - A.z × B.y
  A.z × B.x - A.x × B.z
  A.x × B.y - A.y × B.x

∃ op · 3, infix, 16

A ∈ Vec · B ∈ Vec ≡ A.x × B.x + A.y × B.y + A.z × B.z


;; Recursion test ;;
∃ op sum 2, 10

sum n ∈ Number a ∈ Number ≡
  { sum n - 1 a + n if n > 0,
    a otherwise }


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
∃ op mandelf 3, 10
mandelf C ∈ Complex Z ∈ Complex n ∈ Number ≡
  { mandelf C Z × Z + C n - 1 if n > 0 ∧ (mag Z) < 2,
    n otherwise }

∃ op mandel 4, 10
mandel x ∈ Number y ∈ Number s ∈ Number S ∈ Number ≡
  let q : s / S in
  ∀ P >> (Pixel P.x P.y (mandelf (Complex x + q × P.x y + q × P.y) (Complex 0 0) 256))
