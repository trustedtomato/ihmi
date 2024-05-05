import { ActualDatasetObject } from '../datasets/ActualDatasetObject.js'

export interface Test {
  prompt: string
  score: (
    objects: ActualDatasetObject[],
    allObjects: ActualDatasetObject[]
  ) => number
}
