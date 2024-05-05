import { Either } from '@sweet-monads/either'
import { DatasetObject } from '../tests/datasets/DatasetObject.js'

export type Algorithm = (
  dataset: DatasetObject[],
  userPrompt: string
) => Promise<Either<string, DatasetObject[]>>
