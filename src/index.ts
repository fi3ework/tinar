import Atom from './Atom'
import { autorun } from './observer'
import createTraps from './traps'

function observable<T>(target: T): T {
  if (typeof target !== 'object') {
    throw Error('only accept an object')
  }

  const atom = new Atom(target)
  const proxy = new Proxy(atom, createTraps())
  atom.proxy = proxy
  return proxy
}

export { autorun }
export default observable
