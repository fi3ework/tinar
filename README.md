<p align="center">
    <img align="left" height='150' width='150' src="https://avatars1.githubusercontent.com/u/48382962?s=450&v=4" height=100/>
    <h1 align="left">Inking</h1>
    <p align="left">Light-weight reactive date management library based on ES2015 <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy">Proxy</a>.
    <p>
    <p align="left">
        <i>
            <a href="https://www.npmjs.com/package/inking">
              <img src="https://badgen.net/npm/v/inking" alt="NPM Version">
            </a>
            <a href="https://circleci.com/gh/inkerjs/inking">
              <img src="https://badgen.net/circleci/github/inkerjs/inking">
<a href='https://coveralls.io/github/inkerjs/inking?branch=master'><img src='https://badgen.net/bundlephobia/minzip/inking' alt='Coverage Status' /></a>
            </a>
<a href='https://coveralls.io/github/inkerjs/inking?branch=master'><img src='https://badgen.net/coveralls/c/github/inkerjs/inking/master' alt='Coverage Status' /></a>
        </i>
    </p>
</p>

## Features

- ❄️ **Light-weight**, only 3.3KB after gziped.
- 🎯 **Accurate**, reactions are triggered only when they are needed.
- 💡 **TypeScript supported**, exact type inference.
- 🧩 **Middleware supported**, still working in progress.

## Installation

```bash
$ yarn add inking
```

or

```bash
$ npm i inking
```

## Motivation

[Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) is an awesome feature feature of ES2015. Base on it, we can do meta-programming and hijack object's native operations easier and more seamless. Inking is a state manage library based on Proxy and inspired by awesome [MobX](https://github.com/mobxjs/mobx).

## Concept

- Just Like MobX, any used property of an observable object or class instance in `autorun`, `reaction`, `when` will be collected as dependency of the current reaction and trigger the reaction when it changed.
- Although a number of test cases have been added, Inking is still in a prototype phase and needs `inking-react` and devtools to play with React.
- Feel free to leave any thing in the [issue](https://github.com/inkerjs/inking/issues/new).

## Usage

### Making things observable

<details>
<summary><strong>observable</strong></summary>

**API:**

`observable(object)`

**EXAMPLE:**

```ts
import { observable, autorun } from 'inking'

const counter = observable({ num: 0 })
const countLogger = observe(() => console.log(counter.num))

counter.num++
// $ 1
```

</details>
<details>
<summary><strong>@observable</strong></summary>

**API:**

```ts
@observable
class Model {
    ...
}
```

**EXAMPLE:**

```ts
import { observable } from 'inking'

@observable
class Model {
  count = 0
}

const m = new Model()
autorun(() => {
  console.log(m.count)
})

m.count++
// $ 1
```

</details>
<details>
<summary><strong>object</strong></summary>

Any plain object passed into `observable` will turn to be a observable value.

**EXAMPLE:**

```ts
import { observable } from 'inking'

const person = observable({
  // observable properties:
  name: 'John',
  age: 25,
  showAge: false,

  // computed property:
  get labelText() {
    return `${this.name} (age: ${this.age})`
  },

  setAge(age) {
    this.age = age
  }
})

autorun(() => console.log(person.labelText))

person.name = 'David'
// $: David (age: 25)
person.setAge(26)
// $: David (age: 26)
```

</details>
<details>
<summary><strong>array</strong></summary>

Any array passed into `observable` will turn to be a observable array, even nested.

**EXAMPLE:**

```ts
const todos = observable([{ title: 'a', completed: true }, { title: 'b', completed: false }])

autorun(() => {
  console.log(
    todos
      .filter(todo => !todo.completed)
      .map(todo => todo.title)
      .join('_')
  )
})

todos[0].completed = false
// $ a_b
todos[1].completed = true
// $ a
todos.push({ title: 'c', completed: false })
// $ a_c
todos.pop()
// $ a
todos.shift()
// $
```

</details>

- [ ] map / set
- [ ] boxed values

### Reacting to observables

<details>
<summary><strong>computed</strong></summary>

Computed values are values that can be derived from the existing state or other computed values.

**EXAMPLE:**

```ts
import { observable, computed } from 'inking'

const obj = observable(['eat', 'sleep'])

const c1 = computed(() => {
  return obj.skills.join('_').toLowerCase()
})

autorun(() => {
  console.log(c1.get())
})

obj.skills.push('code')
// $ eat_sleep_code
obj.skills[2] = 'newCode'
// $ eat_sleep_newcode
obj.skills[2] = 'NEWCODE'
// will not print
```

Any getter property of in Class will turn to be a computed value automatically.

**EXAMPLE:**

```ts
import { observable, computed } from 'inking'

@observable
class Person {
  public firstName = 'a'
  public lastName = 'b'
  public arr: any[] = [1, 2, 3]
  public get fullName() {
    return `${this.firstName}_${this.lastName}`.toUpperCase()
  }
}

const p = new Person()

autorun(() => {
  console.log(p.fullName)
})

p.firstName = 'A'
// will not print
p.firstName = 'a'
// will not print
p.firstName = 'newA'
// $ NEWA_B
p.firstName = 'NEWA'
// will not print
```

</details>

</details>
<details>
<summary><strong>autorun</strong></summary>

`autorun` can be used in those cases where you want to create a reactive function that will never have observers itself.

**EXAMPLE:**

```ts
import { autorun } from 'inking'

// ⚠️ disposer is not implemented so far
const disposer = autorun(reaction => {
  /* do some stuff */
})
disposer()

// or

autorun(reaction => {
  /* do some stuff */
  reaction.dispose()
})
```

</details>

</details>

<details>
<summary><strong>when</strong></summary>
`when` observes & runs the given `predicate` until it returns true. Once that happens, the given `effect` is executed and the autorunner is disposed. The function returns a disposer to cancel the autorunner prematurely.

**EXAMPLE:**

```ts
import { observable, when } from 'inking'

const skills = observable(['eat', 'sleep'])

when(
  () => skills.length >= 3,
  () => {
    console.log(skills[skills.length - 1])
  }
)

skills.push('code1')
// $ code1
skills.unshift('code2')
// $ code1
skills.pop()
// $ sleep
skills.shift()
// $ will not print
skills[0] = 'EAT'
// $ will not print
```

</details>

<details>
<summary><strong>reaction</strong></summary>

A variation on autorun that gives more fine grained control on which observables will be tracked.

**EXAMPLE:**

```ts
import { observable, reaction } from 'inking'

const skills = observable(['eat', 'sleep'])

reaction(
  () => obj.skills.length,
  () => {
    console.log(obj.skills[obj.skills.length - 1])
  }
)

skills.push('code1')
// $ code1
skills.unshift('code2')
// $ code1
skills.pop()
// $ sleep
skills.shift()
// $ sleep
skills[0] = 'EAT'
// $ will not print
```

</details>

- [ ] @observer

### Changing observables

<details>
<summary><strong>action</strong></summary>

Any application has actions. Actions are anything that modify the state. With MobX you can make it explicit in your code where your actions live by marking them. Actions help you to structure your code better.

**EXAMPLE:**

```ts
import { observable, action } from 'inking'

const skills = observable(['eat', 'sleep'])

autorun(() => {
  console.log(skills.[1])
})

const act = action(() => {
  obj.skills.unshift('i1')
  obj.skills.unshift('i2')
  obj.skills.pop()
  obj.skills.splice(0, 2, 'i3')
  obj.skills.shift()
})

act()
// $ undefined
```

</details>

- [ ] async actions & flows
- [ ] Object api

### Utility functions

<details>
<summary><strong>toJS</strong></summary>

Return raw value from observable value.

**EXAMPLE:**

```ts
// a test case of Jest
test('basic toJS', () => {
  const obj = observable(getPlainObj())
  const skills = obj.skills
  expect(toJS(obj)).toEqual(getPlainObj())
  expect(toJS(skills)).toEqual(getPlainObj().skills)
})
```

</details>

- [ ] extendObservable
- [ ] createAtom
- [x] intercept
- [ ] observe

### Others

- [ ] Devtools

## Platform support

- **Node**: 6+
- **Chrome**: 49+
- **Firefox**: 38+
- **Safari**: 10+
- **Edge**: 12+
- **Opera**: 36+
- **Internet Explorer**: 🚫
