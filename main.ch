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


;; Mandelbrot ;;

∃ type Complex re, im

∃ op mandel_iter 3, 10

;; mandel_iter C ∈ Complex Z ∈ Complex n ∈ Number ≡
  { mandel_iter }  ;;
