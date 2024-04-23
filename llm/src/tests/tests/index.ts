import { getScore } from '../../utils/get-score.js'
import { ActualDatasetObject } from '../datasets/ActualDatasetObject.js'
import { Test } from './Test.js'

function createScorer(
  criteria: {
    test: string | ((object: ActualDatasetObject) => boolean)
    count: number | 'all'
  }[]
) {
  return (
    objects: ActualDatasetObject[] | null,
    dataset: ActualDatasetObject[]
  ) => {
    const criteriaEvals = criteria.map(({ test, count: rawCount }) => {
      const datasetPass =
        typeof test === 'string'
          ? dataset.filter((object) => object.label === test)
          : dataset.filter(test)

      const objectsPass =
        objects === null
          ? []
          : typeof test === 'string'
          ? objects.filter((object) => object.label === test)
          : objects.filter(test)

      const count = rawCount === 'all' ? datasetPass.length : rawCount

      const canBeSatisfied = datasetPass.length >= count

      return {
        count,
        objectsPass,
        canBeSatisfied
      }
    })

    console.log(criteriaEvals)

    // If a criterium can't be satisfied, null is the right answer to the test.
    if (criteriaEvals.some(({ canBeSatisfied }) => !canBeSatisfied)) {
      return objects === null ? 1 : 0
    }

    const requestSatisfied = criteriaEvals.map(({ objectsPass, count }) => {
      return objectsPass.length >= count
    })

    const countSatisfied = criteriaEvals.map(({ count, objectsPass }) => {
      return objectsPass.length === count
    })

    const overallCountSatisfied =
      criteriaEvals.reduce((sum, { count }) => sum + count, 0) ===
      objects?.length

    console.log(requestSatisfied, countSatisfied, overallCountSatisfied)

    return getScore([
      ...requestSatisfied,
      ...countSatisfied,
      overallCountSatisfied
    ])
  }
}

export const tests: Test[] = [
  {
    prompt: 'Pick up a banana',
    score: createScorer([{ test: 'banana', count: 1 }])
  },
  {
    prompt: 'Pick up a fruit',
    score: createScorer([
      {
        test: (object) => ['banana', 'apple', 'mango'].includes(object.label),
        count: 1
      }
    ])
  },
  {
    prompt: 'Pick up two fruits',
    score: createScorer([
      {
        test: (object) => ['banana', 'apple', 'mango'].includes(object.label),
        count: 2
      }
    ])
  },
  {
    prompt: 'Do a barrel roll',
    score: (objects) => (objects?.length === 0 ? 1 : 0)
  },
  {
    prompt: 'Pick up a cucumber',
    score: createScorer([{ test: 'cucumber', count: 1 }])
  },
  {
    prompt: 'Pick up all the apples',
    score: createScorer([{ test: 'apple', count: 'all' }])
  },
  {
    prompt: 'Retrieve all the tennis balls',
    score: createScorer([{ test: 'tennis ball', count: 'all' }])
  },
  {
    prompt: 'Lift two bananas and one apple',
    score: createScorer([
      { test: 'banana', count: 2 },
      { test: 'apple', count: 1 }
    ])
  },
  {
    prompt: 'Secure all the scissors',
    score: createScorer([{ test: 'scissors', count: 'all' }])
  },
  {
    prompt: 'Grab one mango and two apples',
    score: createScorer([
      { test: 'mango', count: 1 },
      { test: 'apple', count: 2 }
    ])
  },
  {
    prompt: 'Take all the paper towels',
    score: createScorer([{ test: 'paper towel', count: 'all' }])
  },
  {
    prompt: 'Procure three tennis balls',
    score: createScorer([{ test: 'tennis ball', count: 3 }])
  },
  {
    prompt: 'Please pick up one orange and one banana',
    score: createScorer([
      { test: 'orange', count: 1 },
      { test: 'banana', count: 1 }
    ])
  },
  {
    prompt: 'Retrieve all the apples and one mango',
    score: createScorer([
      { test: 'apple', count: 'all' },
      { test: 'mango', count: 1 }
    ])
  },
  {
    prompt: 'Can you grab all the bananas?',
    score: createScorer([{ test: 'banana', count: 'all' }])
  },
  {
    prompt: 'Secure two oranges and one tennis ball',
    score: createScorer([
      { test: 'orange', count: 2 },
      { test: 'tennis ball', count: 1 }
    ])
  },
  {
    prompt: 'Obtain all the scissors and one apple',
    score: createScorer([
      { test: 'scissors', count: 'all' },
      { test: 'apple', count: 1 }
    ])
  },
  {
    prompt: 'Grab all the bananas and one orange',
    score: createScorer([
      { test: 'banana', count: 'all' },
      { test: 'orange', count: 1 }
    ])
  },
  {
    prompt: 'Take all the paper towels and one mango',
    score: createScorer([
      { test: 'paper towel', count: 'all' },
      { test: 'mango', count: 1 }
    ])
  },
  {
    prompt: 'Procure two apples and one orange',
    score: createScorer([
      { test: 'apple', count: 2 },
      { test: 'orange', count: 1 }
    ])
  },
  {
    prompt: 'Please pick up all the tennis balls and one banana',
    score: createScorer([
      { test: 'tennis ball', count: 'all' },
      { test: 'banana', count: 1 }
    ])
  }
]
