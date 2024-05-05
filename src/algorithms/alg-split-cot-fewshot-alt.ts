import { stripIndent } from 'common-tags'
import debug from 'debug'
import { chat } from '../utils/chat.js'
import { cotConsistentShots, cotSystemMessage } from '../utils/messages/cot.js'
import { extractCotAnswer } from '../utils/prompt-functions/extract-cot.js'
import { Algorithm } from './Algorithm.js'
import { isUserPromptRelatedToPickUp } from '../utils/prompt-functions/is-user-prompt-related-to-pickup.js'
import { right } from '@sweet-monads/either'

const log = debug('app:algSplitCotFewshotAlt')

export const algSplitCotFewshotAlt: Algorithm = async (dataset, userPrompt) => {
  const objects = dataset.map((object, index) => ({
    id: index,
    label: object.label
  }))

  const isPickup = await isUserPromptRelatedToPickUp(userPrompt)

  if (isPickup.unwrap() === false) {
    return right([])
  }

  const cotResponse = await chat({
    messages: [
      cotSystemMessage,
      ...cotConsistentShots,
      {
        role: 'user',
        content: stripIndent`
          Objects: ${JSON.stringify(objects)}
          Prompt: ${userPrompt}
        `
      }
    ],
    // Sometimes Mistral continues the chat even after the response is complete,
    // which both slows down the chat and confuses the extraction algorithm.
    shouldStopStreaming: ({ fullResponse }) => {
      return /Answer: \[.*?\]/.test(fullResponse)
    }
  })

  return cotResponse.asyncChain(
    async (cot) => await extractCotAnswer({ cot, dataset })
  )
}
