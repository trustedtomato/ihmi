import { left, right } from '@sweet-monads/either'
import { stripIndent } from 'common-tags'
import debug from 'debug'
import { chat } from '../utils/chat.js'
import { jsonRoot } from '../utils/grammars.js'
import { systemMessageWithoutUnrelated } from '../utils/messages/basic.js'
import { isUserPromptRelatedToPickUp } from '../utils/prompt-functions/is-user-prompt-related-to-pickup.js'
import { Algorithm } from './Algorithm.js'

const log = debug('app:algZeroshotWithPrecheck')

export const algZeroshotWithPrecheck: Algorithm = async (
  dataset,
  userPrompt
) => {
  const objects = dataset.map((object, index) => ({
    id: index,
    label: object.label
  }))

  const isPickup = await isUserPromptRelatedToPickUp(userPrompt)

  if (isPickup.unwrap() === false) {
    return right([])
  }

  const response = await chat({
    messages: [
      systemMessageWithoutUnrelated,
      {
        role: 'user',
        content: stripIndent`
          Objects: ${JSON.stringify(objects)}
          Prompt: ${userPrompt}
        `
      }
    ],
    isJson: 'any',
    grammar: `${jsonRoot} answerprefix natintarray answerpostfix`,
    maxLength: 100,
    transform: ({ answer: objIds }: { answer: number[] }) => {
      if (objIds.length !== new Set(objIds).size) {
        return left('Try again. Duplicate object IDs are not allowed.')
      }
      const nonexistentIds = objIds.filter((id) => !objects[id])
      if (nonexistentIds.length > 0) {
        return left(
          `Try again. The following object IDs do not exist: ${nonexistentIds.join(
            ', '
          )}`
        )
      }
      const datasetObjs = objIds.map((id) => dataset[id])
      return right(datasetObjs)
    }
  })

  return response
}
