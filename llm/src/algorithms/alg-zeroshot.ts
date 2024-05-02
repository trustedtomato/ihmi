import { left, right } from '@sweet-monads/either'
import { stripIndent, stripIndents } from 'common-tags'
import debug from 'debug'
import { chat } from '../utils/chat.js'
import { jsonRoot } from '../utils/grammars.js'
import { Algorithm } from './Algorithm.js'

const log = debug('app:algZeroshot')

export const algZeroshot: Algorithm = async (dataset, userPrompt) => {
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
          respond with []. If the user asks for
          something that is not in the list of objects, respond with
          null, indicating that we need more searching.
        `
      },
      {
        role: 'user',
        content: stripIndent`
          Objects: ${JSON.stringify(objects)}
          Prompt: ${userPrompt}
        `
      }
    ],
    isJson: 'any',
    grammar: `${jsonRoot} answerprefix (natintarray | "null") answerpostfix`,
    maxLength: 100,
    transform: ({ answer: objIds }: { answer: number[] }) => {
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
