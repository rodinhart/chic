import {
  interpret,
  operators,
  parse,
  prn,
  tableOperators,
  tokenize,
} from "./chic.js"

const thread = (x, ...fns) => fns.reduce((r, fn) => fn(r), x)

const S = 100

const source = await fetch("./main.ch").then((r) => r.text())

const tokens = tokenize(source)
// console.log("tokens:", tokens)

const env = { ...operators }
let result = null
while (tokens.length) {
  const exp = parse(tokens, env)
  // console.log("exp:", prn(exp))
  result = interpret(exp, env)
}

console.table(tableOperators(env))

console.log("result:", prn(result))

if (false) {
  const canvas = document.createElement("canvas")
  canvas.width = S
  canvas.height = S
  document.body.appendChild(canvas)
  const g = canvas.getContext("2d")

  const t = Array.from({ length: S }, (_, i) => i)
  const input = t.flatMap((y) => t.map((x) => env.Point.dispatch._(x, y)))
  console.time("mandel")
  const pixels = env.mandel.dispatch["Number|Number|Number|Number"](
    -2,
    -2,
    4,
    S
  )(input)
  console.timeEnd("mandel")

  const pad = (x) => ("0" + x.toString(16)).slice(-2)

  console.time("plot")
  for (const { x, y, col } of pixels) {
    const red = ((col >>> 1) & 8) | (col & 7)
    const green = ((col >>> 3) & 12) | (col & 3)
    const blue = ((col >>> 4) & 8) | ((col >> 1) & 4) | (col & 3)
    g.fillStyle = `#${pad(17 * red)}${pad(17 * green)}${pad(17 * blue)}`
    g.fillRect(x, y, 1, 1)
  }
  console.timeEnd("plot")
}

if (true) {
  const H = 400
  const canvas = document.createElement("canvas")
  canvas.width = H
  canvas.height = H
  document.body.appendChild(canvas)
  const g = canvas.getContext("2d")

  const Vec = env.Vec.dispatch._
  const cube = {
    vertices: [
      Vec(-1, -1, -1),
      Vec(1, -1, -1),
      Vec(1, 1, -1),
      Vec(-1, 1, -1),
      Vec(-1, -1, 1),
      Vec(1, -1, 1),
      Vec(1, 1, 1),
      Vec(-1, 1, 1),
    ],
  }

  let frame = 0
  const render = () => {
    const points = thread(
      cube.vertices,
      env.render.dispatch["Vec|Vec|Number"](
        Vec(0, 0, frame / 60),
        Vec(0, 10, 0),
        H
      )
    )

    g.clearRect(0, 0, H, H)
    for (const { x, y } of points) {
      g.fillStyle = "white"
      g.fillRect(H / 2 + x, H / 2 - y, 2, 2)
    }

    frame++

    requestAnimationFrame(() => {
      render()
    })
  }

  render()
}
