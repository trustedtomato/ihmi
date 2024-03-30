import { ActualDatasetObject } from '../datasets/ActualDatasetObject.js'
import { DatasetObject } from '../datasets/DatasetObject.js'

export interface Test {
  prompt: string
  score: (objects: ActualDatasetObject[]) => number
}
