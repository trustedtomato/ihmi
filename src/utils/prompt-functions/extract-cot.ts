import { left, right } from '@sweet-monads/either'
import { DatasetObject } from '../../tests/datasets/DatasetObject.js'
import { chat } from '../chat.js'
import { jsonRoot } from '../grammars.js'
import {
  extractCotShots,
  extractCotSystemMessage
} from '../messages/extract-cot.js'

export const extractCotAnswer = async ({
  cot,
  dataset
}: {
  cot: string
  dataset: DatasetObject[]
}) => {
  const response = await chat({
    messages: [
      extractCotSystemMessage,
      ...extractCotShots,
      {
        role: 'user',
        content: cot
      }
    ],
    isJson: 'any',
    grammar: `${jsonRoot} answerprefix natintarray answerpostfix`,
    maxLength: 100,
    transform: ({ answer: objIds }: { answer: number[] }) => {
      if (objIds.length !== new Set(objIds).size) {
        return left('Try again. Duplicate object IDs are not allowed.')
      }
      const nonexistentIds = objIds.filter((id) => !dataset[id])
      if (nonexistentIds.length > 0) {
        return left(
          `Try again. The following object IDs do not exist: ${nonexistentIds.join(
            ', '
          )}`
        )
      }
      // const objs = objIds.map(id => objects[id])
      const datasetObjs = objIds.map((id) => dataset[id])
      return right(datasetObjs)
    }
  })
  return response
}
