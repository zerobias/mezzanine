//@flow

import Type from '../type'

const Tuple = (...types: *) => Type`Tuple${types.length}`(types, {
  length: () => types.length,
  [Symbol.iterator](ctx) {
    return function* () {
      const length = ctx.length
      for (let i = 0; i < length; i++)
        yield (ctx[i])
    }
  },
}).contramap((...types: *) => types)

export default Tuple
