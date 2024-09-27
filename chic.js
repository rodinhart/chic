class Destruct {
  constructor(args) {
    this.args = args
  }
}

const type = (x) => x?.constructor?.name ?? "Null"

const interpret = (exp, env) =>
  ({
    Array: () => {
      const [rand, ...rators] = exp
      const op = interpret(rand, env)

      if (op.primitive) {
        return op.primitive(rators, env)
      }

      const args = rators.map((rator) => interpret(rator, env))

      const t = type(args[0]) === "Object" ? args[0].type : type(args[0])

      if (!(t in op.dispatch)) {
        if ("_" in op.dispatch) {
          return op.dispatch["_"](...args)
        } else {
          throw new Error(`Cannot dispatch ${t} on ${rand}`)
        }
      }

      return op.dispatch[t](...args)
    },
    Number: () => exp,
    String: () => {
      if (!(exp in env)) {
        throw new Error(`Unknown symbol ${exp}`)
      }

      return env[exp]
    },
  }[type(exp)]())

const parse = (tokens, env) => {
  let i = 0

  const expression = (min = -1) => {
    if (i >= tokens.length) {
      throw new Error(`Unexpected EOF`)
    }

    const token = tokens[i++]

    if (token === "(") {
      const sub = expression()

      if (tokens[i++] !== ")") {
        throw new Error(`Expected closing ) but found ${tokens[i - 1]}`)
      }

      return infix(sub, min)
    }

    const op = env[token]
    if (op && !op.infix && op.precedence > min) {
      return infix(
        [
          token,
          ...Array.from({ length: op.arity }, () => expression(op.precedence)),
        ],
        min
      )
    }

    return infix(token, min)
  }

  const infix = (lhs, min) => {
    const token = tokens[i]
    const op = env[tokens[i]]
    if (!(op?.infix && op.precedence > min)) {
      return lhs
    }

    i++

    const rhs = expression(op.precedence)

    return infix([token, lhs, rhs], min)
  }

  const exp = expression()
  tokens.splice(0, i)
  return exp
}

const prn = (value) => {
  const dispatch = {
    Array: () => `(${value.map(prn).join(" ")})`,
    Destruct: () => `[${value.args.map(prn).join(" ")}]`,
    Number: () => String(value),
    Object: () => `${value.type} ${value.args.map(prn).join(" ")}`,
    String: () => value,
  }

  if (!(type(value) in dispatch)) {
    throw new Error(`Cannot prn ${type(value)}`)
  }

  return dispatch[type(value)]()
}

const tokenize = (s) => {
  const _ = (xs) => {
    const x = xs.shift()

    if (x === "[") {
      const args = []
      while (xs.length && xs[0] !== "]") {
        args.push(_(xs))
      }

      if (xs[0] !== "]") {
        throw new Error(`Expected closing ] but found ${x[0]}`)
      }

      xs.shift()

      return new Destruct(args)
    }

    if (String(Number(x)) === x) {
      return Number(x)
    }

    return x
  }

  const xs = s
    .replace(/([()[\]])/g, " $1 ")
    .trim()
    .split(/\s+/)
  const tokens = []
  while (xs.length) {
    tokens.push(_(xs))
  }

  return tokens
}

const operators = {
  "√": {
    arity: 1,
    dispatch: {
      Number: (a) => Math.sqrt(a),
    },
    precedence: 300,
  },

  "×": {
    arity: 2,
    dispatch: {
      Number: (a, b) => a * b,
    },
    infix: true,
    precedence: 200,
  },

  "·": {
    arity: 2,
    dispatch: {},
    infix: true,
    precedence: 200,
  },

  "/": {
    arity: 2,
    dispatch: {
      Number: (a, b) => a / b,
    },
    infix: true,
    precedence: 200,
  },

  "+": {
    arity: 2,
    dispatch: {
      Number: (a, b) => a + b,
    },
    infix: true,
    precedence: 100,
  },

  "-": {
    arity: 2,
    dispatch: {
      Number: (a, b) => a - b,
    },
    infix: true,
    precedence: 100,
  },

  "∃": {
    arity: 2,
    precedence: 0,
    primitive: (rators, env) => {
      const [name, arity] = rators
      env[name] = {
        arity,
        dispatch: {
          _: (...args) => ({ type: name, args }),
        },
        precedence: 400,
      }
    },
  },

  "≡": {
    arity: 2,
    infix: true,
    precedence: 0,
    primitive: (rators, env) => {
      const [lhs, rhs] = rators
      const [op, ...params] = lhs
      env[op].dispatch[params[0][0]] = (...args) => {
        const newEnv = { ...env }
        for (let p = 0; p < params.length; p++) {
          const param = params[p]
          const arg = args[p]
          for (let i = 1; i < param.length; i++) {
            newEnv[param[i]] = arg.args[i - 1] // could be zip
          }
        }

        return interpret(rhs, { ...newEnv })
      }
    },
  },
}

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

console.log("result:", prn(result))

/*
   how to define operators
     exists operator with arity n, infix

   how to capture complete type
     mag Vec a1 a2 a3 ≡ √(Vec a1 a2 a3 · Vec a1 a2 a3)
    versus
     mag Vec v ≡ √(v · v)

   Do we like
     Vec (a1 + b1) (a2 + b2) (a3 + b3)
    versus
     Vec a1 + b1 a2 + b2 a3 + b3
*/
