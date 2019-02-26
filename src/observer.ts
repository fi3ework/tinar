import Atom from './Atom'
import { once } from './utils'

let currentCollectingEffect: SideEffect | null = null

export interface IEffect {
  dependencies: Atom[]
  predictFn: (...args: any) => boolean
  sideEffectFn: Function
}

type ISideEffectType = `computed` | `reaction`

export class SideEffect implements IEffect {
  public type!: ISideEffectType
  public sideEffectFn
  public dependencies = []
  public constructor(fn: Function) {
    this.sideEffectFn = fn
  }
  public predictFn = () => true

  public runEffect = () => {
    if (this.predictFn()) {
      this.sideEffectFn()
    }
  }
}

export const getCurrCollectingEffect = () => {
  return currentCollectingEffect
}

export const resetCurrCollectingEffect = () => {
  currentCollectingEffect = null
}

export const autorun = (fn: any) => {
  // collect dependency
  // TODO: if multi run, use promise to delay or give every reaction a id?
  const sideEffect = new SideEffect(fn)
  currentCollectingEffect = sideEffect
  sideEffect.sideEffectFn()
  currentCollectingEffect = null
}

type predicateType = () => boolean

export const when = (predicate: predicateType, fn: Function) => {
  const sideEffect = new SideEffect(fn)
  sideEffect.predictFn = predicate
  // `predicate` function will collect dependencies
  // `fn` is the real callback will be triggered
  currentCollectingEffect = sideEffect
  predicate()
  currentCollectingEffect = null
}
