'use strict'
const { default: verify, typeSign, Shape } = require('../src/verify')

// {
//   Ack     : { id: Number, data: Object },
//   LongPoll: { wait: Number }
// }

describe('validate native type', () => {
  test('single type', () => {
    const type = Number
    const dataValid = 0
    const dataInvalid1 = 'ghf0'
    const dataInvalid2 = {}
    const dataInvalid3 = { a: 0 }

    expect(verify(type, dataValid)).toBe(true)
    expect(verify(type, dataInvalid1)).toBe(false)
    expect(verify(type, dataInvalid2)).toBe(false)
    expect(verify(type, dataInvalid3)).toBe(false)
  })
  test('single inner type', () => {
    const type = { wait: Number }
    const dataValid = { wait: 0 }
    const dataInvalid1 = { _: 'no' }
    const dataInvalid2 = { wait: '0' }
    const dataInvalid3 = {}
    expect(verify(type, dataValid)).toBe(true)
    // expect(verify(type, dataInvalid1)).toBe(false)
    // expect(verify(type, dataInvalid2)).toBe(false)
    // expect(verify(type, dataInvalid3)).toBe(false)
  })

  test('validate object with several fields', () => {
    const type = { wait: String, id: Number, fn: Function }
    const dataValid1 = { wait: 'ok', id: 0, fn: function(){} }
    const dataValid2 = { wait: '', id: Infinity, fn(){} }
    const dataValid3 = { wait: String('ok'), id: NaN, fn: () => {} }
    const dataInvalid1 = { wait: {}, id: 0, fn: function(){} }
    const dataInvalid2 = { id: 0, fn: function(){} }
    const dataInvalid3 = { wait: 'ok', id: 0, fn: [] }
    const dataInvalid4 = { wait: 'ok', id: '0', fn: function(){} }
    expect(verify(type, dataValid1)).toBe(true)
    expect(verify(type, dataValid2)).toBe(true)
    expect(verify(type, dataValid3)).toBe(true)
    expect(verify(type, dataInvalid1)).toBe(false)
    expect(verify(type, dataInvalid2)).toBe(false)
    expect(verify(type, dataInvalid3)).toBe(false)
    expect(verify(type, dataInvalid4)).toBe(false)
  })
})

describe('validate function type', () => {
  const avoid = { not: 'allowed' }
  const rule = (property, typeKey, data) =>
    property !== 'reject' &&
    typeKey !== 'fail' &&
    data[property] !== avoid

  test('function as inner type', () => {

    const type = { field: rule }

    const dataValid1 = { field: { key: 'prop' }, prop: '' }
    const dataValid2 = { field: {} }
    const dataValid3 = {}
    const dataInvalid1 = { field: 'reject' }
    const dataInvalid2 = { field: 'ref', ref: avoid }

    expect(verify(type, dataValid1)).toBe(true)
    expect(verify(type, dataValid2)).toBe(true)
    expect(verify(type, dataValid3)).toBe(true)
    expect(verify(type, dataInvalid1)).toBe(false)
    expect(verify(type, dataInvalid2)).toBe(false)
  })
  test.skip('function as main type', () => {
    const type = rule

    const dataValid1 = { key: 'prop', prop: '' }
    const dataValid2 = {}
    const dataInvalid1 = { key: 'reject' }
    const dataInvalid2 = { key: 'ok', fail: true }
    const dataInvalid3 = { key: 'ref', ref: avoid }

    expect(verify(type, dataValid1)).toBe(true)
    expect(verify(type, dataValid2)).toBe(true)
    expect(verify(type, dataInvalid1)).toBe(false)
    expect(verify(type, dataInvalid2)).toBe(false)
    expect(verify(type, dataInvalid3)).toBe(false)
  })
})

test('inner validation type', () => {
  const typeInner = Shape({ wait: Number })
  const type = Shape({ id: Number, child: typeInner })
  const resu = type.toJSON()
  console.log(typeInner)
  typeInner
  const iter = [...type]
  iter
  const dataValid = { id: 0, child: { wait: 0 } }
  const dataInvalid1 = { id: 0 }
  const dataInvalid2 = { id: 0, child: {} }
  const dataInvalid3 = { id: 0, child: { wait: '0' } }
  const dataInvalid4 = { id: 0, child: null }

  expect(verify(type, dataValid)).toBe(true)
  expect(verify(type, dataInvalid1)).toBe(false)
  expect(verify(type, dataInvalid2)).toBe(false)
  expect(verify(type, dataInvalid3)).toBe(false)
  expect(verify(type, dataInvalid4)).toBe(false)
})
