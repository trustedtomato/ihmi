import ollama, { type ChatRequest } from 'ollama'
import debug from 'debug'
import { Either, left, right } from '@sweet-monads/either'
import { asyncChainLeft } from './async-chain-left.js'

const log = debug('app:chat')

export const chat = async <T>(
  request: Partial<ChatRequest>,
  /**
   * Transform the response to the desired type. Left string is interpreted as
   * error text, and the chat will continue with the error text as the next
   * message.
   */
  transform: (x: any) => Either<string, T>,
  retries = 3
): Promise<Either<string, T>> => {
  const response = await ollama.chat({
    model: 'dolphin-phi',
    ...request,
    stream: true,
    options: {
      ...request.options,
      temperature: 1
    }
  })

  log('generating response')
  let responseText = ''
  for await (const part of response) {
    responseText += part.message.content
    process.stdout.write(part.message.content)
  }
  console.log()

  log('parsing response')
  const responseObject =
    request.format === 'json' ? JSON.parse(responseText) : responseText

  const result = transform(responseObject)
  return asyncChainLeft(result, async (error) => {
    if (retries <= 0) {
      log('retries exhausted')
      return left(error)
    }
    log('error received, retrying')
    console.log('user:', error)
    return await chat(
      {
        ...request,
        messages: [
          ...(request.messages || []),
          {
            role: 'assistant',
            content: responseText
          },
          {
            role: 'user',
            content: error
          }
        ]
      },
      transform,
      retries - 1
    )
  })
}
