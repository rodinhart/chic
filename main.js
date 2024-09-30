import {
  interpret,
  operators,
  parse,
  prn,
  tableOperators,
  tokenize,
} from "./chic.js"

const source = await Deno.readTextFile("main.ch")

const tokens = tokenize(source)
// console.log("tokens:", tokens)

const env = { ...operators }
let result = null
while (tokens.length) {
  const exp = parse(tokens, env)
  console.log("exp:", prn(exp))
  result = interpret(exp, env)
}

console.table(tableOperators(env))

console.log("result:", prn(result))

console.log(env)

const S = 8
const t = Array.from({ length: S }, (_, i) => i)
const input = t.flatMap((y) => t.map((x) => env.Point.dispatch._(x, y)))
console.log("called: ", env.mandel.dispatch.Number(-2, -2, 4, S)(input))
