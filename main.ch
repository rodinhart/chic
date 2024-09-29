∃ type Vec x, y, z

A ∈ Vec + B ∈ Vec ≡ Vec A.x + B.x  A.y + B.y  A.z + B.z

A ∈ Vec × B ∈ Vec ≡ Vec
  A.y × B.z - A.z × B.y
  A.z × B.x - A.x × B.z
  A.x × B.y - A.y × B.x

∃ op · 3, infix, ×

A ∈ Vec · B ∈ Vec ≡ A.x × B.x + A.y × B.y + A.z × B.z

√((Vec 2 3 4) · (Vec 6 7 1))
