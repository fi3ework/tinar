import { observable } from '../src/index'

const obj = observable({
  name: 'Adam',
  family: {
    father: {
      name: 'daddy'
    },
    mother: {
      name: 'mummy'
    }
  },
  pets: [
    {
      type: 'cat',
      name: 'Cathy'
    }
  ],
  skills: ['eat', 'sleep']
})

test('key/value access right', () => {
  const o = observable(obj)
  expect(o.name).toBe('Adam')
  expect(o.family.father.name).toBe('daddy')
  expect(o.pets[0].name).toBe('Cathy')
  expect(o.pets.length).toBe(1)
  expect(o.skills[0]).toBe('eat')
  expect(o.skills.length).toBe(2)
})
