
import { Union, Type, Maybe } from '../src'


const inc = n => {
  if (n === 6e3) {
    // throw new Error('fail')
  }
  const result = n + 1
  return result
}

const Num = Type`Num`(Number)

let Counter = Num
for (let i = 0; i < 10e3; ++i)
  Counter = Counter.contramap(inc)
// const value1 = Counter(0)
// console.log(value1)

const { pipe, map, filter, chain } = require('ramda')

const filterFarmer = human => human.occupation === 'farmer'

const users = {
  230: { name: 'bob', occupation: 'farmer' },
  231: { name: 'jerry', occupation: 'doctor' },
  232: { name: 'frank', occupation: 'teacher' }
}

const readField = prop => data => {
  return data[prop]
}

const toUpperCase = (text) => text.toUpperCase()

const readName = (id) =>
  Maybe(users)
    .map(readField(id))
    .filter(filterFarmer)
    // .map(readField('name'))
    // .map(toUpperCase)
    // .toJSON()

console.log(readName(NaN)) // => { type: 'Just', value: 'BOB' }
// readName(231) // => { type: 'Nothing', value: undefined }
// readName(NaN)

