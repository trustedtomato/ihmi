import { left, right } from '@sweet-monads/either'
import { stripIndent, stripIndents } from 'common-tags'
import debug from 'debug'
import { DatasetObject } from '../tests/datasets/DatasetObject.js'
import { chat } from '../utils/chat.js'
import { jsonRoot } from '../utils/grammars.js'
import { Algorithm } from './Algorithm.js'

const log = debug('app:algZeroshot')

export const algZeroshot: Algorithm = async (dataset, userPrompt) => {
  const objects = dataset.map((object, index) => `${object.label}`)

  const response = await chat({
    messages: [
      {
        role: 'system',
        content: stripIndents`
          You will be given a list of objects in the room,
          and you need to select which objects to pick up based
          on what the user asks for. It is crucial to pick up the right
          amount of objects.

          Reply with a {"answer": <array of objects to be picked up>}.
          If the user asks for something unrelated to picking up objects,
          the answer should be []. If the user asks for
          something that is not in the list of objects, the answer should be
          null, indicating that we need more searching.
        `
      },
      {
        role: 'user',
        content: stripIndent`
          Objects: ${objects}
          Prompt: ${userPrompt}
        `
      }
    ],
    isJson: 'any',
    grammar: `${jsonRoot} answerprefix (stringarray | "null") answerpostfix`,
    maxLength: 100,
    transform: ({ answer: answerObjects }: { answer: string[] }) => {
      if (answerObjects === null) {
        return right(null)
      }

      const availableObjects = [...dataset]
      const answerDatasetObjects: DatasetObject[] = []
      for (const object of answerObjects) {
        const datasetObjectIndex = availableObjects.findIndex(
          (availableObject, index) => `${availableObject.label}` === object
        )
        if (datasetObjectIndex === -1) {
          return left(
            'Try again. You must select objects from the list, and maximum as many as available.'
          )
        }
        answerDatasetObjects.push(availableObjects[datasetObjectIndex])
        availableObjects.splice(datasetObjectIndex, 1)
      }

      return right(answerDatasetObjects)
    }
  })

  return response
}
