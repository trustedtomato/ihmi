import { stripIndent, stripIndents } from 'common-tags'
import { Algorithm } from './Algorithm.js'
import { chat } from '../utils/chat.js'
import { left, right } from '@sweet-monads/either'
import debug from 'debug'
import { jsonRoot } from '../utils/grammars.js'

const log = debug('app:algFewshot')

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
  { role: 'assistant', content: `Object IDs: ${a}` }
]

export const algFewshot: Algorithm = async (dataset, userPrompt) => {
  const objects = dataset.map((object, index) => ({
    id: index,
    label: object.label
  }))

  const response = await chat({
    messages: [
      {
        role: 'system',
        content: stripIndents`
            You will be given a list of objects in the room,
            and you need to select which objects to pick up based
            on what the user asks for. It is crucial to pick up the right
            amount of objects.

            Reply with a JSON array of object IDs to be picked up.
            If the user asks for something unrelated to picking up objects,
            you should respond with []. If the user asks for
            something that is not in the list of objects, you should respond with
            null, indicating that we need more searching.
          `
      },
      ...createExampleMessagePair('Pick up the apple.', '[0]'),
      ...createExampleMessagePair('Pick up the apple and a hat.', '[0,3]'),
      ...createExampleMessagePair('Give me a fruit.', '[1]'),
      ...createExampleMessagePair('Give me some bananas.', '[1, 5]'),
      ...createExampleMessagePair('What time is it?', '[]'),
      ...createExampleMessagePair('The weather is nice.', '[]'),
      ...createExampleMessagePair('Pick up two apples', 'null'),
      ...createExampleMessagePair('Pick up the orange.', 'null'),
      {
        role: 'user',
        content: stripIndent`
          Objects: ${JSON.stringify(objects)}
          Prompt: ${userPrompt}
        `
      },
      {
        role: 'assistant',
        content: 'Object IDs:'
      }
    ],
    isJson: 'any',
    maxLength: 100,
    grammar: `${jsonRoot} answerprefix (natintarray | "null") answerpostfix`,
    // grammar: stripIndent(`root ::= ([0-9]+ ("," [0-9]+)*)?[\n ]+`),
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
}
