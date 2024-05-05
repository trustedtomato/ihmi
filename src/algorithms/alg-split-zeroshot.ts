import { left, right } from '@sweet-monads/either'
import { stripIndent, stripIndents } from 'common-tags'
import debug from 'debug'
import { chat } from '../utils/chat.js'
import { jsonRoot } from '../utils/grammars.js'
import { Algorithm } from './Algorithm.js'

const log = debug('app:algZeroshot')

export const algSplitZeroshot: Algorithm = async (dataset, userPrompt) => {
  const objects = dataset.map((object, index) => ({
    id: index,
    label: object.label
  }))

  const isPickup = await chat({
    messages: [
      {
        role: 'system',
        content: stripIndents`
          You need to determine if the user's request is related to picking up objects.
          If yes, reply with {"answer": true}, otherwise reply with {"answer": false}.
        `
      },
      {
        role: 'user',
        content: stripIndent`
          Prompt: ${userPrompt}
        `
      }
    ],
    isJson: 'any',
    grammar: `${jsonRoot} answerprefix ("true" | "false") answerpostfix`,
    maxLength: 100,
    transform: ({ answer: isPickup }: { answer: boolean }) => {
      return right(isPickup)
    }
  })

  if (isPickup.unwrap() === false) {
    return right([])
  }

  const canBeSatisfied = await chat({
    messages: [
      {
        role: 'system',
        content: stripIndents`
          You will be given a list of objects in the room and a user prompt,
          and you need to determine if the user's request can be satisfied
          with the objects in the room. If yes, reply with {"answer": true},
          otherwise reply with {"answer": false}.
        `
      },
      {
        role: 'user',
        content: stripIndent`
          Objects: ${JSON.stringify(objects.map((o) => o.label))}
          Prompt: ${userPrompt}
        `
      }
    ],
    isJson: 'any',
    grammar: `${jsonRoot} answerprefix ("true" | "false") answerpostfix`,
    maxLength: 100,
    transform: ({ answer: requiresMoreSearching }: { answer: boolean }) => {
      return right(requiresMoreSearching)
    }
  })

  if (canBeSatisfied.unwrap() === false) {
    return right(null)
  }

  const response = await chat({
    messages: [
      {
        role: 'system',
        content: stripIndents`
          You will be given a list of objects in the room,
          and you need to select which objects to pick up based
          on what the user asks for. It is crucial to pick up the right
          amount of objects.

          The answer should be a JSON array of object IDs to be picked up,
          or a singleton of one object ID if only one item is required.
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
    grammar: `${jsonRoot} answerprefix natintarray answerpostfix`,
    maxLength: 100,
    transform: ({ answer: objIds }: { answer: number[] }) => {
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
      const datasetObjs = objIds.map((id) => dataset[id])
      return right(datasetObjs)
    }
  })

  return response
}
