# Chic

The language Chic was written in the spirit of [Nile](https://github.com/damelang/nile) in order to understand Nile better. The tokenizer, parser and interpreter lives in chic.js, while the main demonstration resides in main.chic.

Running something like

```
npx http-server -p 8081
```

will expose index.html/index.js which will evaluate main.chic. The result will be that several operators (functions) will be added to the environment. The complete table of operators is logged to the console, and two demo functions will be used to display a spinning cube, and, if enabled in index.js, the Mandelbrot set. By default the Mandelbrot set is disabled, as it is quite slow.

## Some example syntax

Chic uses a lot of mathematical symbols instead of keywords. This makes the code short, but perhaps less readable. Fun though.

**`∃ type Vec x, y, z`** Defines a new type Vec with fields x, y and z. Read as "There exists a type Vec of x, y and z".

**`A ∈ Vec + B ∈ Vec ≡ Vec A.x + B.x  A.y + B.y  A.z + B.z`** Implements addition for vectors. Read as "A which is an element of Vec, plus B element of Vec is defined as a vector of element by element addition".

**`∃ op · 3, infix, 16`** Define a new operator dot of arity 3, is infix with precedence level 16. Read as "The exists an operator · " etc.

**`project scale ∈ Number ≡ ∀ V >> scale × (Point V.x / V.y  V.z / V.y)`** Implements the operator project which takes a scaling factor and returns a pipe that projects a stream of vectors onto points. Read right hand side as "For all V, stream out the expression scale x ..." etc.

**`getPoints R ∈ Vec T ∈ Vec scale ∈ Number ≡ rotate R → translate T → project scale`** Implements getPoints which takes rotation, translation and scaling arguments and returns a pipe. Read right hand side as "compose the rotation pipe with the translation pipe, then compose with the project pipe".

**`let x : 10 in <expr>`** Binds the result of an expression (10 in this example) to a symbol (x) which is then available in the expression <expr>.

**`{ -x if x < 0, x otherwise }`** Conditional expression. Read exactly as stated: "-x if x less than 0, x otherwise".

**`;; comment ::`** Comments start and end with ;;.

## Why Chic

Nile Rodgers is a member of Chic.

## todo

- different ×
- implement let
  - don't like -, can't use ≡
- less precedence by using right associative
- ast to string/source
- how to do |Z|
- change function call to f(x, y) ?
- env.Point.dispatch.\_(x, y) to be env.Point(x, y)
- what operators/types can be defined in chic
