import { stripIndents } from 'common-tags'
import {
  createExampleMessagePair,
  shotsWithoutUnrelated
} from './basic-split.js'

// SYSTEM MESSAGES
export const systemMessage = {
  role: 'system',
  content: stripIndents`
    You will be given a list of objects in the room,
    and you need to select which objects to pick up based
    on what the user asks for. Try to pick up exactly
    as many items as the user asks for.

    Reply with a JSON array of object IDs to be picked up.
    If the user asks for something unrelated to picking up objects,
    respond with [].
  `
}

// SHOTS
export const shots = [
  ...shotsWithoutUnrelated,
  ...createExampleMessagePair('What time is it?', '[]'),
  ...createExampleMessagePair('The weather is nice.', '[]')
]
