const decomma = (struct) => {
  const params = []
  while (struct?.[0] === ",") {
    params.unshift(struct[2])
    struct = struct[1]
  }
  params.unshift(struct)

  return params
}

export const interpret = (exp, env) =>
  ({
    Array: () => {
      const [rand, ...rators] = exp
      const op = interpret(rand, env)

      if (op.primitive) {
        return op.primitive(rators, env)
      }

      const args = rators.map((rator) => interpret(rator, env))

      const t = args
        .map((arg) => (type(arg) === "Object" ? arg.type : type(arg)))
        .join("|")

      if (!op.dispatch) {
        throw new Error(`No dispatch for ${rand}`)
      }

      if (!(t in op.dispatch)) {
        if ("_" in op.dispatch) {
          return op.dispatch["_"](...args)
        } else {
          throw new Error(`Cannot dispatch ${t} on ${rand}`)
        }
      }

      return op.dispatch[t](...args)
    },
    Boolean: () => exp,
    Number: () => exp,
    String: () => {
      if (!(exp in env)) {
        throw new Error(`Unknown symbol ${exp}`)
      }

      return env[exp]
    },
  }[type(exp)]())

export const parse = (tokens, env) => {
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
    if (
      op &&
      !op.infix &&
      (op.precedence > min || (op.right && op.precedence === min))
    ) {
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

export const prn = (value) => {
  const dispatch = {
    Array: () => `(${value.map(prn).join(" ")})`,
    Boolean: () => String(value),
    Function: () => value.source ?? String(value),
    Number: () => String(value),
    Null: () => "null",
    Object: () => Object.values(value).join(" "),
    String: () => value,
  }

  if (!(type(value) in dispatch)) {
    throw new Error(`Cannot prn ${type(value)}`)
  }

  return dispatch[type(value)]()
}

export const tableOperators = (operators) =>
  Object.values(
    Object.groupBy(
      Object.entries(operators),
      ([, { precedence }]) => precedence
    )
  )
    .sort((a, b) => -a[0][1].precedence + b[0][1].precedence)
    .map((group) => ({
      operators: group.map(([name]) => name).join(" "),
      precedence: group[0][1].precedence,
    }))

export const tokenize = (s) => {
  const skipComment = (xs) => {
    if (xs[0] === ";;") {
      xs.shift()
      while (xs.length && xs[0] !== ";;") {
        xs.shift()
      }

      if (xs[0] !== ";;") {
        throw new Error(`Expected closing ;; but found ${tokens[0]}`)
      }

      xs.shift()
    }
  }

  const _ = (xs) => {
    const x = xs.shift()

    if (String(Number(x)) === x) {
      return Number(x)
    }

    if (x === "true") {
      return true
    }

    if (x === "false") {
      return false
    }

    return x
  }

  const xs = s
    .replace(/([()]|[a-zA-Z_0-9]+|-[0-9]+)/g, " $1 ")
    .trim()
    .split(/\s+/)
  const tokens = []
  skipComment(xs)
  while (xs.length) {
    tokens.push(_(xs))
    skipComment(xs)
  }

  return tokens
}

const type = (x) => x?.constructor?.name ?? "Null"

export const operators = {
  "∈": {
    arity: 2,
    infix: true,
    precedence: 20,
  },

  ".": {
    arity: 2,
    infix: true,
    precedence: 20,
    primitive: (rators, env) => {
      const obj = interpret(rators[0], env)
      const key = rators[1]
      if (!(key in obj)) {
        throw new Error(`Unknown field ${key} on ${prn(obj)}`)
      }

      return obj[key]
    },
  },

  "£": {
    arity: 2,
    dispatch: {
      _: (arr, i) => arr[i],
    },
    infix: true,
    precedence: 19.5,
  },

  "√": {
    arity: 1,
    dispatch: {
      Number: (a) => Math.sqrt(a),
    },
    precedence: 18,
  },

  cos: {
    arity: 1,
    dispatch: {
      Number: (a) => Math.cos(a),
    },
    precedence: 18,
  },

  sin: {
    arity: 1,
    dispatch: {
      Number: (a) => Math.sin(a),
    },
    precedence: 18,
  },

  "×": {
    arity: 2,
    dispatch: {
      "Number|Number": (a, b) => a * b,
    },
    infix: true,
    precedence: 16,
  },

  "/": {
    arity: 2,
    dispatch: {
      "Number|Number": (a, b) => a / b,
    },
    infix: true,
    precedence: 16,
  },

  "+": {
    arity: 2,
    dispatch: {
      "Number|Number": (a, b) => a + b,
    },
    infix: true,
    precedence: 14,
  },

  "-": {
    arity: 2,
    dispatch: {
      "Number|Number": (a, b) => a - b,
    },
    infix: true,
    precedence: 14,
  },

  ">": {
    arity: 2,
    dispatch: {
      "Number|Number": (a, b) => a > b,
    },
    infix: true,
    precedence: 12,
  },

  "<": {
    arity: 2,
    dispatch: {
      "Number|Number": (a, b) => a < b,
    },
    infix: true,
    precedence: 12,
  },

  "∧": {
    arity: 2,
    infix: true,
    precedence: 11,
    primitive: (rators, env) => {
      const [a, b] = rators

      return interpret(a, env) && interpret(b, env)
    },
  },

  if: {
    arity: 2,
    infix: true,
    precedence: 6,
  },

  otherwise: {
    arity: 1,
    precedence: 6,
  },

  "→": {
    arity: 2,
    dispatch: {
      _: (f, g) => (input) => g(f(input)),
    },
    infix: true,
    precedence: 6,
  },

  ":": {
    arity: 2,
    infix: true,
    precedence: 4.5,
  },

  "⇒": {
    arity: 2,
    dispatch: {
      _: (x, f) => f(x),
    },
    infix: true,
    precedence: 5,
  },

  ",": {
    arity: 2,
    dispatch: {
      _: (car, cdr) => new Cons(car, cdr),
    },
    infix: true,
    precedence: 4,
  },

  "{": {
    arity: 2,
    precedence: 3,
    primitive: (rators, env) => {
      if (
        !(
          rators[1] === "}" ||
          (rators[1]?.[0] === "otherwise" && rators[1][1] === "}")
        )
      ) {
        throw new Error(`Expected closing } but found ${rators[1]}`)
      }

      for (const clause of decomma(rators[0])) {
        if (clause?.[0] === "if") {
          const [, cons, pred] = clause
          if (interpret(pred, env)) {
            return interpret(cons, env)
          }
        } else {
          return interpret(clause, env)
        }
      }
    },
  },

  "}": {
    arity: 0,
    precedence: 3,
  },

  "∀": {
    arity: 2,
    precedence: 1,
    primitive: (rators, env) => {
      const [name, body] = rators
      const fn = (xs) => {
        const out = []
        for (const x of xs) {
          const r = interpret(body, { ...env, [name]: x })
          if (r?.type === ">>") {
            out.push(r.val)
          }
        }

        return out
      }

      fn.source = prn(body)

      return fn
    },
    right: true,
  },

  ">>": {
    arity: 1,
    dispatch: {
      _: (val) => ({ type: ">>", val }),
    },
    precedence: 3.5,
    right: true,
  },

  let: {
    arity: 3,
    precedence: 1,
    primitive: (rators, env) => {
      if (rators[1] !== "in") {
        throw new Error(`Expected let ... in ... but found ${rators[1]}`)
      }

      const defs = decomma(rators[0])
      const newEnv = { ...env }
      for (const def of defs) {
        if (def?.[0] !== ":") {
          throw new Error(`Expected let . : . but found ${def}`)
        }

        newEnv[def[1]] = interpret(def[2], newEnv)
      }

      return interpret(rators[2], newEnv)
    },
    right: true,
  },

  "∃": {
    arity: 3,
    precedence: 0,
    primitive: (rators, env) => {
      const name = rators[1]
      const params = decomma(rators[2])

      if (rators[0] === "type") {
        env[name] = {
          arity: params.length,
          dispatch: {
            _: (...args) => ({
              type: name,
              ...Object.fromEntries(params.map((param, i) => [param, args[i]])),
            }),
          },
          precedence: 10,
          right: true,
        }
      } else {
        env[name] = {
          arity: params[0],
          dispatch: {},
          infix: params.includes("infix"),
          precedence: params[params.length - 1],
          right: !params.includes("infix"),
        }
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
      for (const param of params) {
        if (param[0] !== "∈") {
          throw new Error(`Expected ∈ for dispatch`)
        }
      }

      env[op].dispatch[params.map((param) => param[2]).join("|")] = (
        ...args
      ) => {
        const newEnv = { ...env }
        for (let p = 0; p < params.length; p++) {
          const param = params[p]
          const arg = args[p]
          newEnv[param[1]] = arg
        }

        return interpret(rhs, { ...newEnv })
      }
    },
  },
}
