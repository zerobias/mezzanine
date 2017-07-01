//@flow

import { flatten } from 'ramda'

import * as CheckRules from './check'
import Check from './check'
import Either from '../utils/either'
import { curry2 } from '../utils/fp'
import arrify from '../utils/arrify'

type TRule = Rule<any>
type TCheck = Check<any>
type RuleType = TCheck | TRule | Array<TCheck | TRule>
//$FlowIssue
type RuleUnit = RuleType | Array<RuleType>
type RuleList = Array<RuleUnit | Array<RuleUnit | RuleType | TCheck | TRule> | TCheck | TRule>
type Rules = RuleUnit | RuleType | Set<RuleUnit | RuleType> | TCheck | TRule

const preprocessRules = (list: *) => {
  const first = list[0]
  if (list.length === 1) return arrify(first)
  return new Set(list.map(arrify))
}

export class Rule<Annotation = 'Rule'> {
  name: Annotation
  rules: TCheck | TRule | Array<RuleType> | Set<TCheck | TRule | RuleList | RuleUnit | RuleType>
  error: (val: mixed) => (lastError: string) => string
  validate(val: mixed) {
    return validateRules(this.rules)(val).mapl(this.error(val))
  }
  constructor(name: Annotation,
              error?: null | (val: mixed, lastError: string) => string,
              ...rules: Array<Array<RuleUnit | RuleType | TCheck | TRule> | RuleUnit | TCheck | TRule>) {
    this.name = name
    //$FlowIssue
    this.rules = preprocessRules(rules)
    const err = error == null
      ? (_, err) => err
      : error
    this.error = curry2(err)
    // this.validate = ()

    // this.validate = val => valid(val).mapl(val => {
    //     val
    //     return val
    //   })

    // this.error = error
  }
}

function of<Annotation, T: Array<RuleUnit | RuleType | TCheck | TRule> | RuleUnit | TCheck | TRule>(
  name: Annotation,
  error?: null | (val: mixed, lastError: string) => string, ...rules: Array<T>) {
    //$FlowIssue
    const result: Rule<Annotation> = new Rule(name, error, ...rules)
    return result
}

type ValidateRules = <List: Rules>(rules: List) => (val: mixed) => Either<mixed, string>
const validateRules: ValidateRules = (rules) => (val) => {
  let result: Either<mixed, string> = new Either(val, 'right')
  const rulesList = Array.isArray(rules)
    ? rules
    : [rules]
  for (const rule of rulesList) {
    if (rule instanceof Check) {
      result = result.chain(applyCheck(rule))
    } else if (rule instanceof Rule) {
      result = result.chain(validateRules(rule.rules))
    } else if (rule instanceof Set) {
      const [first, ...subSet] = [...rule]
      result = validateRules(first)(val)
      result
      result = subSet.reduce(
        (acc, subrule) => {
          const subresult = validateRules(subrule)(val)
          subresult
          const res = acc.alt(subresult)
          return res
        },
        result)
    } else if (Array.isArray(rule)) {
      result = rule.reduce(
        (acc, val) => acc.chain(validateRules(val)),
        result)
    } else {
      rule
    }
    result
    if (result.isLeft()) return result
  }
  return result
}

const RuleSet = (
  name: *,
  error: (val: mixed, lastError: string) => string,
  ...rules: Array<RuleList | Set<RuleList | RuleUnit | RuleType>>
) => of(name, error, ...rules)

type AnyOf = <T: Array<Rules>>(...list: Array<T>) => Set<Rules>
const anyOf: AnyOf = (...list) => new Set(list.map(flatten))

const applyCheck =
  (check: Check<any>) =>
    (val: mixed) =>
      Either.validate(check.check, {
        Right: (obj) => obj,
        Left : (obj) => check.error(obj)
      }, val)


export const isObject: Rule<'is non nullable object'> =
  of('is non nullable object', null, [CheckRules.isObject, CheckRules.isNotNull])
const isArrayOrString: Rule<'is array or string'> = RuleSet(
  'is array or string',
  (val, err) => `${String(val)} should be array or string. Got error ${err}`,
  [CheckRules.isArray], [CheckRules.isString]
)

export const isNotEmpty: Rule<'is not empty array or string'> =
  of('is not empty array or string', null, [
    isArrayOrString,
    CheckRules.isNotEmpty,
  ])

export default Rule
