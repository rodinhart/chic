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


;; Matrix ;;
∃ type Matrix
  a, b, c,
  d, e, f,
  g, h, i

M ∈ Matrix × N ∈ Matrix ≡ Matrix
  M.a × N.a + M.b + N.d + M.c × N.g  M.a × N.b + M.b + N.e + M.c × N.h  M.a × N.c + M.b + N.f + M.c × N.i
  M.d × N.a + M.e + N.d + M.f × N.g  M.d × N.b + M.e + N.e + M.f × N.h  M.d × N.c + M.e + N.f + M.f × N.i
  M.g × N.a + M.h + N.d + M.i × N.g  M.g × N.b + M.h + N.e + M.i × N.h  M.g × N.c + M.h + N.f + M.i × N.i

M ∈ Matrix × V ∈ Vec ≡ Vec
  M.a × V.x + M.b × V.y + M.c × V.z
  M.d × V.x + M.e × V.y + M.f × V.z
  M.g × V.x + M.h × V.y + M.i × V.z

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


;; 3d ;;
∃ op project 1, 10
project scale ∈ Number ≡
  ∀ V >> Point scale × V.x / V.y scale × V.z / V.y

∃ op rotate 2, 10
rotate R ∈ Vec V ∈ Vec ≡ 
  let Rz : Matrix cos R.z 0-sin R.z 0
                  sin R.z cos R.z   0
                  0     0           1 in
  Rz × V

∃ op translate 1, 10
translate T ∈ Vec ≡
  ∀ V >> Vec V.x + T.x V.y + T.y V.z + T.z

∃ op render 3, 10
render R ∈ Vec T ∈ Vec scale ∈ Number ≡
  ∀ V let W : rotate R V,
          X : Vec W.x + T.x W.y + T.y W.z + T.z in
      >> Point scale × X.x / X.y scale × X.z / X.y

;; render R T scale ≡ rotate R -> translate T -> project scale