import { stripIndent, stripIndents } from 'common-tags'
import { Algorithm } from './Algorithm.js'
import { chat } from '../utils/chat.js'
import { left, right } from '@sweet-monads/either'
import debug from 'debug'

const log = debug('app:algorithm1')

export const algorithm2: Algorithm = async (dataset, userPrompt) => {
  const objects = dataset.map((object, index) => ({
    id: index,
    ...object
  }))

  const numberOfPickups = await chat(
    {
      messages: [
        {
          role: 'system',
          content: stripIndents`
            I have an algorithm which can pick up objects, and I need your help to select how many objects to pick up.
            If you are not sure that the user wants to pick up any objects, reply with 0. In your reply, you should have only exactly one integer.
          `
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      grammar: stripIndent(`root ::= [1-9] [0-9]*`)
    }
  )

  log('numberOfPickups', numberOfPickups)

  const response = await chat(
    {
      messages: [
        {
          role: 'system',
          content: stripIndents`
            I have an algorithm which can pick up objects, and I need your help to select which objects to pick up
            based on the following objects in the room:

            ${JSON.stringify(objects)}

            Reply with a comma-separated list of object IDs, e.g. "0,1,2". The list should probably contain exactly ${numberOfPickups} object IDs.

            Some examples:
            - Give me an orange and a banana: 0,1
            - Pick up the apple: 2
            - Pick up nothing:
            - Something unrelated:
            - Pick up two fruits: 0,1
          `
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      grammar: stripIndent(`root ::= "" | ([0-9]+ (("," | [ \t\n]+) [0-9]+)*)`),
      transform: (response: string) => {
        const objIds = response.split(',').map(id => parseInt(id))
        if (objIds.length !== new Set(objIds).size) {
          return left('Try again. Duplicate object IDs are not allowed.')
        }
        const nonexistentIds = objIds.filter(id => !objects[id])
        if (nonexistentIds.length > 0) {
          return left(`Try again. The following object IDs do not exist: ${nonexistentIds.join(', ')}`)
        }
        const objs = objIds.map(id => objects[id])
        return right(objs)
      }
    }
  )

  return response
}
