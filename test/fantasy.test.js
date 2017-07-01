'use strict'

import { Type } from '../src'



test('.map method', () => {
  const Point = Type`Point`({
    x: Number,
    y: Number,
  })

  const point1 = Point({ x: 1, y: 10 })

  const inc = ({ x, y }) => ({
    x: x++,
    y: y++,
  })

  expect(point1.map).toBeDefined()
  expect(() => {
    const mapped = point1.map(inc)
    mapped.equals({ x: 2, y: 11 })
  }).not.toThrow()
})

