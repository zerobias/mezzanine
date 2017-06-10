'use strict'
import verify from '../src/verify'

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
  test('edge case', () => {
    const type = {}
    const dataValid = {}
    const dataInvalid2 = function() {}
    const dataInvalid3 = true
    expect(verify(type, dataValid)).toBe(true)
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
    expect(verify(type, dataInvalid1)).toBe(false)
    expect(verify(type, dataInvalid2)).toBe(false)
    expect(verify(type, dataInvalid3)).toBe(false)
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
  const rule = (property, typeKey) =>
    property !== 'reject' &&
    typeKey !== 'fail'

  test('function as inner type', () => {

    const type = { field: rule }

    const dataValid1 = { field: { key: 'prop' }, prop: '' }
    const dataValid2 = { field: {} }
    const dataInvalid1 = { field: 'reject' }

    expect(verify(type, dataValid1)).toBe(true)
    expect(verify(type, dataValid2)).toBe(true)
    expect(verify(type, dataInvalid1)).toBe(false)
  })
  test('function as main type', () => {
    const type = rule

    const dataValid1 = { key: 'prop', prop: '' }
    const dataValid2 = {}
    const dataInvalid1 = 'reject'

    expect(verify(type, dataValid1)).toBe(true)
    expect(verify(type, dataValid2)).toBe(true)
    expect(verify(type, dataInvalid1)).toBe(false)
  })

  test('pass nullable', () => {
    const type = (val) => val == null
    const valid1 = null
    const valid2 = undefined
    expect(verify(type, valid1)).toBe(true)
    expect(verify(type, valid2)).toBe(true)
    expect(verify(type, )).toBe(true)
  })

})
