import { stripIndent, stripIndents } from 'common-tags'

// SYSTEM MESSAGES
export const systemMessageWithoutUnrelated = {
  role: 'system',
  content: stripIndents`
    You will be given a list of objects in the room,
    and you need to select which objects to pick up based
    on what the user asks for. Try to pick up exactly
    as many items as the user asks for.

    Reply with a JSON array of object IDs to be picked up.
  `
}

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
  { role: 'assistant', content: `{"answer": ${a}}` }
]

export const shotsWithoutUnrelated = [
  ...createExampleMessagePair('Pick up the apple.', '[0]'),
  ...createExampleMessagePair('Pick up the apple and a hat.', '[0,3]'),
  ...createExampleMessagePair('Give me a fruit.', '[0]'),
  ...createExampleMessagePair('Give me some bananas.', '[1, 5]'),
  ...createExampleMessagePair('Pick up two apples', '[0]'),
  ...createExampleMessagePair('Pick up the orange.', '[]')
]

export const shots = [
  ...shotsWithoutUnrelated,
  ...createExampleMessagePair('What time is it?', '[]'),
  ...createExampleMessagePair('The weather is nice.', '[]')
]
