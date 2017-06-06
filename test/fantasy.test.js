'use strict'
import { associativity as associativitySemi } from 'fantasy-land/laws/semigroup'
import { reflexivity, symmetry, transitivity } from 'fantasy-land/laws/setoid'
import {
  identity as identFunctor,
  composition as compFunctor
} from 'fantasy-land/laws/functor'
import { composition } from 'fantasy-land/laws/apply'
import { identity, homomorphism, interchange } from 'fantasy-land/laws/applicative'
import { associativity as associativityChain } from 'fantasy-land/laws/chain'
import {
  leftIdentity as leftIdentityMonad,
  rightIdentity as rightIdentityMonad
} from 'fantasy-land/laws/monad'
import { associativity as associativityExtend } from 'fantasy-land/laws/extend'
import {
  leftIdentity as leftIdentityComonad,
  rightIdentity as rightIdentityComonad
} from 'fantasy-land/laws/comonad'

import { Type } from '../src'


describe('Type fantasy-land spec', () => {
  const Point = Type`Point`({
    x: Number,
    y: Number,
  })

  const data1 = { x: 1, y: 10 }

  const eq = Point.equals
  const of = Point.of

  const point1 = Point(data1)
  test('semigroup', () => {
    expect(associativitySemi(
      Point, eq, data1
    )).toBeTruthy()
  })

  test('setoid', () => {
    expect(symmetry(
      Point, eq, data1
    )).toBeTruthy()
    expect(transitivity(
      Point, eq, data1
    )).toBeTruthy()
    expect(reflexivity(
      Point, eq, data1
    )).toBeTruthy()
  })

  test('functor', () => {
    expect(identFunctor(
      of, eq, data1
    )).toBeTruthy()
    expect(compFunctor(
      of, eq,
      ({ x, y }) => ({ x: x+1, y }),
      ({ x, y }) => ({ x, y: y * 2 }),
      data1,
    )).toBeTruthy()
  })


  test('apply', () => {
    expect(composition(
      Point, eq, data1
    )).toBeTruthy()
  })


  test('applicative', () => {
    expect(identity(
      Point, eq, data1
    )).toBeTruthy()
    expect(homomorphism(
      Point, eq, data1
    )).toBeTruthy()
    expect(interchange(
      Point, eq, data1
    )).toBeTruthy()
  })

  test('chain', () => {
    expect(associativityChain(
      Point, eq, data1
    )).toBeTruthy()
  })

  test('monad', () => {
    expect(leftIdentityMonad(
      Point, eq,
      ({ x, y }) => Point({ x: x+1, y }),
      data1,
    )).toBeTruthy()
    expect(rightIdentityMonad(
      Point, eq, data1
    )).toBeTruthy()
  })

  test('extend', () => {
    expect(associativityExtend(
      Point, eq, data1
    )).toBeTruthy()
  })

  test('comonad', () => {
    expect(leftIdentityComonad(
      Point, eq,
      ({ x, y }) => Point({ x: x+1, y }),
      data1,
    )).toBeTruthy()
    expect(rightIdentityComonad(
      Point, eq, data1
    )).toBeTruthy()
  })
})
