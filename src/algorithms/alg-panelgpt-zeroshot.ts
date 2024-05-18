import { stripIndent } from 'common-tags'
import debug from 'debug'
import { chat } from '../utils/chat.js'
import { cotSystemMessage } from '../utils/messages/cot.js'
import { extractCotAnswer } from '../utils/prompt-functions/extract-cot.js'
import { Algorithm } from './Algorithm.js'

const log = debug('app:algPanelgptZeroshot')

export const algPanelgptZeroshot: Algorithm = async (dataset, userPrompt) => {
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
        content:
          // See: https://github.com/holarissun/PanelGPT
          stripIndent`
            3 experts are discussing the question with a panel discussion,
            trying to solve it step by step, and make sure the result
            is correct and avoid penalty:
          `
      }
    ],
    // Sometimes Mistral continues the chat even after the response is complete,
    // which both slows down the chat and confuses the extraction algorithm.
    shouldStopStreaming: ({ fullResponse }) => {
      return (
        /Answer: (\[.*?\])/.test(fullResponse) ||
        fullResponse.includes('Objects:') ||
        fullResponse.includes('Prompt:')
      )
    }
  })

  return cotResponse.asyncChain(
    async (cot) => await extractCotAnswer({ cot, dataset })
  )
}
