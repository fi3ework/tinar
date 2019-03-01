import Atom from './Atom'
import { globalState } from './globalState'

let currentCollectingEffect: SideEffect | null = null
type SideEffectType = `computed` | `reaction`

export interface IEffect {
  dependencies: Atom[]
  predictFn: (...args: any) => boolean
  sideEffectFn: Function
}

export function startBatch() {
  if (globalState.batchDeep === 0) {
    // If starting a new queue from deep 0, clear the original queue.
    globalState.pendingReactions = new Set()
  }

  globalState.batchDeep++
  globalState.isPendingTransaction = true
}

export function endBatch() {
  if (--globalState.batchDeep === 0) {
    // runPendingReactions()
    globalState.isPendingTransaction = false
    runPendingReactions()
  }
}

export function runPendingReactions() {
  // The number of queue executions.
  let currentRunCount = 0
  const MAX_COUNT = 999

  globalState.pendingReactions.forEach(sideEffect => {
    currentRunCount++

    if (currentRunCount >= MAX_COUNT) {
      globalState.pendingReactions.clear()
      return
    }

    sideEffect.runEffectWithPredict()
  })

  // Clear pending reactions.
  globalState.pendingReactions.clear()
}

export class SideEffect implements IEffect {
  public type!: SideEffectType // TODO: assign it in constructor
  /**
   * for `reaction`, `when`, this is the first function argument
   */
  public dependenciesCollector: ((...args: any[]) => any) | null = null
  /**
   * the real side effect function should be invoked
   * TODO: distinguish `dependenciesCollector` & `sideEffectFn` for `autorun`?
   */
  public sideEffectFn
  /**
   * for `computed`, the dependencies who dependent on this effect
   */
  public dependencies = []
  public constructor(fn: Function) {
    this.sideEffectFn = fn
  }
  public predictFn = () => true

  public runEffectWithPredict = () => {
    if (this.predictFn()) {
      // pass arguments
      // TODO: should pass arguments no matter what effect type is?
      let collectorRes = null
      if (typeof this.dependenciesCollector === 'function') {
        collectorRes = this.dependenciesCollector()
      }
      this.sideEffectFn(collectorRes)
    }
  }
}

export const getCurrCollectingEffect = () => {
  return currentCollectingEffect
}

export const setCurrCollectingEffect = (effect: SideEffect) => {
  currentCollectingEffect = effect
}

export const resetCurrCollectingEffect = () => {
  currentCollectingEffect = null
}

export const autorun = (fn: any, type: SideEffectType = 'reaction') => {
  // collect dependency
  // TODO: if multi run, use promise to delay or give every reaction a id?
  const sideEffect = new SideEffect(fn)
  sideEffect.type = type
  currentCollectingEffect = sideEffect
  sideEffect.sideEffectFn()
  currentCollectingEffect = null
}
