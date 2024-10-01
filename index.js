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

const source = await fetch("./main.chic").then((r) => r.text())

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
  const coords = ({ x, y }) => [H / 2 + x, H / 2 - y]

  const Vec = env.Vec.dispatch._
  const Sur = env.Surface.dispatch._
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
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ],
    surfaces: [
      Sur(0, 1, 4, 1),
      Sur(1, 5, 4, 1),

      Sur(1, 2, 5, 2),
      Sur(2, 6, 5, 2),

      Sur(2, 3, 6, 3),
      Sur(3, 7, 6, 3),

      Sur(3, 0, 7, 4),
      Sur(0, 4, 7, 4),

      Sur(4, 5, 7, 5),
      Sur(5, 6, 7, 5),

      Sur(3, 2, 0, 6),
      Sur(2, 1, 0, 6),
    ],
  }

  let frame = 0
  const render = () => {
    // const points = thread(
    //   cube.vertices,
    //   env.getPoints.dispatch["Vec|Vec|Number"](
    //     Vec(frame / 150, frame / 100, frame / 50),
    //     Vec(0, 10, 0),
    //     H
    //   )
    // )

    const triangles = thread(
      cube.surfaces,
      env.getTriangles.dispatch["Array|Vec|Vec|Number"](
        cube.vertices,
        Vec(frame / 150, frame / 100, frame / 50),
        Vec(0, 10, 0),
        H
      )
    )

    g.clearRect(0, 0, H, H)
    for (const { a, b, c, col } of triangles) {
      g.fillStyle = [
        "black",
        "coral",
        "olivedrab",
        "gold",
        "steelblue",
        "deeppink",
        "powderblue",
      ][col]
      g.strokeStyle = g.fillStyle
      g.beginPath()
      g.moveTo(...coords(a))
      g.lineTo(...coords(b))
      g.lineTo(...coords(c))
      g.closePath()
      g.fill()
      g.stroke()
    }
    // for (const [a, b] of cube.edges) {
    //   g.strokeStyle = "white"
    //   g.beginPath()
    //   g.moveTo(...coords(points[a]))
    //   g.lineTo(...coords(points[b]))
    //   g.stroke()
    // }

    frame++

    requestAnimationFrame(() => {
      render()
    })
  }

  render()
}
