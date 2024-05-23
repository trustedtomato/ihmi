import { stripIndent } from 'common-tags'
import debug from 'debug'
import { chat } from '../utils/chat.js'
import { cotSystemMessage } from '../utils/messages/cot.js'
import { extractCotAnswer } from '../utils/prompt-functions/extract-cot.js'
import { Algorithm } from './Algorithm.js'

const log = debug('app:algCotZeroshot')

export const algCotZeroshot: Algorithm = async (dataset, userPrompt) => {
  const objects = dataset.map((object, index) => ({
    id: index,
    label: object.label
  }))

  const cotResponse = await chat({
    messages: [
      cotSystemMessage,
      {
        role: 'user',
        content: stripIndent`
          Objects: ${JSON.stringify(objects)}
          Prompt: ${userPrompt}
        `
      },
      {
        role: 'assistant',
        content: "Let's think step by step."
      }
    ],
    // Sometimes Mistral continues the chat even after the response is complete,
    // which both slows down the chat and confuses the extraction algorithm.
    shouldStopStreaming: ({ fullResponse }) => {
      return (
        /Answer: (\[.*?\])/.test(fullResponse) ||
        fullResponse.includes('Objects:') ||
        fullResponse.includes('\nobjects:') ||
        fullResponse.includes('Prompt:') ||
        fullResponse.includes('\nprompt:') ||
        fullResponse.includes('===')
      )
    }
  })

  return cotResponse.asyncChain(
    async (cot) => await extractCotAnswer({ cot, dataset })
  )
}
