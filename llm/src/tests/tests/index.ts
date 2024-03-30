import { getScore } from '../../utils/get-score.js'
import { Test } from './Test.js'

export const tests: Test[] = [
  {
    prompt: 'Pick up a banana',
    score: (objects) =>
      getScore([
        [objects.length === 1, 1],
        [objects.every((object) => object.label.includes('banana')), 1]
      ])
  },
  {
    prompt: 'Pick up a fruit',
    score: (objects) =>
      getScore([
        [objects.length === 1, 1],
        [
          objects.every((object) =>
            ['banana', 'apple', 'mango'].includes(object.label)
          ),
          1
        ]
      ])
  },
  {
    prompt: 'Pick up two fruits',
    score: (objects) =>
      getScore([
        [objects.length === 2, 1],
        [
          objects.every((object) =>
            ['banana', 'apple', 'mango'].includes(object.label)
          ),
          1
        ]
      ])
  },
  {
    prompt: 'Do a barrel roll',
    score: (objects) => getScore([[objects.length === 0, 1]])
  }
]
