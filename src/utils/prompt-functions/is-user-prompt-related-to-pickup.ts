import { right } from '@sweet-monads/either'
import { stripIndent } from 'common-tags'
import { chat } from '../chat.js'
import { jsonRoot } from '../grammars.js'

export const isUserPromptRelatedToPickUp = async (userPrompt: string) => {
  const isPickup = await chat({
    messages: [
      {
        role: 'system',
        content: stripIndent`
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
  return isPickup
}
