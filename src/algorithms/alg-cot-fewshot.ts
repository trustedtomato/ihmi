import { stripIndent, stripIndents } from 'common-tags'
import { Algorithm } from './Algorithm.js'
import { chat } from '../utils/chat.js'
import { left, right } from '@sweet-monads/either'
import debug from 'debug'
import { jsonRoot } from '../utils/grammars.js'

const log = debug('app:algCotFewshot')

const exampleDataset = [
  'apple',
  'banana',
  'tennis ball',
  'hat',
  'potato',
  'banana'
].map((label, index) => ({ label, id: index }))
const createExampleMessagePair = (q: string, a: string) => [
  {
    role: 'user',
    content: stripIndent`
      Objects: ${JSON.stringify(exampleDataset)}
      Prompt: ${q}
    `
  },
  { role: 'assistant', content: `${a}\n` }
]

export const algCotFewshot: Algorithm = async (dataset, userPrompt) => {
  const objects = dataset.map((object, index) => ({
    id: index,
    label: object.label
  }))

  const cotResponse = await chat({
    messages: [
      {
        role: 'system',
        content: stripIndents`
            You will be given a list of objects in the room,
            and you need to select which objects to pick up based
            on what the user asks for. It is crucial to pick up the right
            amount of objects.

            The final answer should be a JSON array of object IDs to be picked up.
            If the user asks for something unrelated to picking up objects,
            conclude with []. If the user asks for
            something that is not in the list of objects, conclude with
            null, indicating that we need more searching.
          `
      },
      ...createExampleMessagePair(
        'Pick up the apple.',
        '"The apple" implies one apple. An apple is present with an ID of 0. Answer: [0].'
      ),
      ...createExampleMessagePair(
        'Pick up the apple and a hat.',
        '"The apple" implies one apple, and "a hat" implies one hat. An apple is present with an ID of 0, and a hat is present with an ID of 3. Answer: [0, 3].'
      ),
      ...createExampleMessagePair(
        'Give me a fruit.',
        "In the list of objects, there are multiple fruits: apples and bananas. Apples and bananas have the IDs of 0, 1 and 5. Let's pick the first one for consistency. Answer: [0]."
      ),
      ...createExampleMessagePair(
        'Give me some bananas.',
        '"Some bananas" implies more than one banana. Bananas are present with IDs of 1 and 5. Answer: [1, 5].'
      ),
      ...createExampleMessagePair(
        'What time is it?',
        'The user is not asking for any objects. Answer: [].'
      ),
      ...createExampleMessagePair(
        'Pick up two apples',
        'The user is asking for two apples, but there is only one apple present. Answer: null.'
      ),
      ...createExampleMessagePair(
        'Pick up the orange.',
        'There is no orange present. Answer: null.'
      ),
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
      return /Answer: (\[.*?\]|null)/.test(fullResponse)
    }
  })

  return cotResponse.asyncChain(async (cot) => {
    const response = await chat({
      messages: [
        {
          role: 'system',
          content: stripIndents`
            Extract the object IDs from the user prompt.
            The answer should be a JSON array of object IDs, or null.
          `
        },
        {
          role: 'user',
          content:
            '"Some bananas" implies more than one banana. Bananas are present with IDs of 1 and 5. Answer: [1, 5].'
        },
        {
          role: 'assistant',
          content: '[1, 5]'
        },
        {
          role: 'user',
          content:
            'The user is asking for two apples, but there is only one apple present. Answer: null.'
        },
        {
          role: 'assistant',
          content: 'null'
        },
        {
          role: 'user',
          content:
            '"The apple" implies one apple. An apple is present with an ID of 0. Answer: [0].'
        },
        {
          role: 'assistant',
          content: '[0]'
        },
        {
          role: 'user',
          content: cot
        }
      ],
      isJson: 'any',
      grammar: `${jsonRoot} answerprefix (natintarray | "null") answerpostfix`,
      // grammar: stripIndent(`root ::= ([0-9]+ ("," [0-9]+)*)?[\n ]+`),
      maxLength: 100,
      transform: (objIds: number[] | null) => {
        if (objIds === null) {
          return right(null)
        }

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
        // const objs = objIds.map(id => objects[id])
        const datasetObjs = objIds.map((id) => dataset[id])
        return right(datasetObjs)
      }
    })
    return response
  })
}
