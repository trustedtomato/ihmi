import { stripIndents } from 'common-tags'
import { Algorithm } from './Algorithm.js'
import { chat } from '../utils/chat.js'
import { left, right } from '@sweet-monads/either'
import debug from 'debug'
import { DatasetObject } from '../tests/datasets/DatasetObject.js'

const log = debug('app:algZeroshotJson')

export const algZeroshotJson: Algorithm = async (dataset, userPrompt) => {
  const objects = dataset.map((object, index) => ({
    id: index,
    ...object
  }))

  const response = await chat(
    {
      messages: [
        {
          role: 'system',
          content: stripIndents`
            Here are the detected objects in JSON format:
            ${JSON.stringify(objects)}

            Select which objects should be picked up. Respond with a JSON object which has a single field, "selectedObjects", which is an array of object IDs to be picked up.
          `
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      isJson: 'object',
      transform: (responseJson: any) => {
        if (!responseJson?.selectedObjects) {
          return left('Wrong. No selectedObjects field found in response')
        }
  
        if (!Array.isArray(responseJson.selectedObjects)) {
          return left('Wrong. selectedObjects field is not an array')
        }
  
        const objects: DatasetObject[] = []
        const nonExistentIds: number[] = []
        for (const id of responseJson.selectedObjects) {
          const fixedId = parseInt(id)
          if (isNaN(fixedId)) {
            return left(
              'Wrong. selectedObjects field should be an array of numbers, where each number is an object ID'
            )
          }
  
          const object = dataset[id]
          if (!object) {
            nonExistentIds.push(id)
            continue
          }
  
          objects.push(object)
        }
  
        return right(objects)
      }
    }
  )

  log('response', response)

  return response
}
