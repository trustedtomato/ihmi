import { stripIndent, stripIndents } from 'common-tags'
import { Algorithm } from './Algorithm.js'
import { chat } from '../utils/chat.js'
import { left, right } from '@sweet-monads/either'
import debug from 'debug'

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
            I have an algorithm which can pick up objects, and I need your help to select which objects to pick up
            based on the following objects in the room:

            ${JSON.stringify(objects)}

            Reply with a list of object IDs to be picked up, separated by commas.
          `
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    isJson: 'any',
    grammar: stripIndent(
      `root ::= "[" ([0-9]+ (("," | [ \t\n]+) [0-9]+)*)? "]"`
    ),
    // grammar: stripIndent(`root ::= ([0-9]+ ("," [0-9]+)*)?[\n ]+`),
    maxLength: 100,
    transform: (objIds: number[]) => {
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
