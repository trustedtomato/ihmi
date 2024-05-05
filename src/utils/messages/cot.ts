import { stripIndent, stripIndents } from 'common-tags'

// SYSTEM MESSAGES
export const cotSystemMessage = {
  role: 'system',
  content: stripIndents`
    You will be given a list of objects in the room,
    and you need to select which objects to pick up based
    on what the user asks for. Try to pick up exactly
    as many items as the user asks for.

    Think step-by-step.
    Conclude with a JSON array of object IDs to be picked up.
    If the user asks for something unrelated to picking up objects,
    conclude with [].
  `
}

// SHOTS
const exampleDataset = [
  'apple', // 0
  'banana', // 1
  'tennis ball', // 2
  'hat', // 3
  'potato', // 4
  'banana' // 5
].map((label, index) => ({ label, id: index }))
const createExampleMessagePair = (q: string, a: string) => [
  {
    role: 'user',
    content: stripIndent`
      Objects: ${JSON.stringify(exampleDataset)}
      Prompt: ${q}
    `
  },
  { role: 'assistant', content: `${a}\n` }
]

export const cotConsistentShots = [
  ...createExampleMessagePair(
    'Pick up the banana.',
    `Let's think step by step. We have to pick up 1 banana. Bananas are present with the IDs 1 and 5. We have to pick up 1 banana, so let's pick the first one for consistency. Answer: [1].`
  ),
  ...createExampleMessagePair(
    'Pick up the banana and a hat.',
    `Let's think step by step. We have to pick up 1 banana and 1 hat. Bananas are present with the IDs 1 and 5, and a hat is present with the ID 3. There is only 1 hat present, so we should pick that up. We have to pick up 1 banana, so let's pick the first one for consistency. Answer: [1, 3].`
  ),
  ...createExampleMessagePair(
    'Give me a fruit.',
    `Let's think step by step. We have to pick up 1 fruit. In the list of objects, there are multiple fruits: apples and bananas. Apples and bananas have the IDs of 0, 1 and 5. We have to pick up 1 fruit, so let's pick the first one for consistency. Answer: [0].`
  ),
  ...createExampleMessagePair(
    'Give me some bananas.',
    `Let's think step by step. We have to pick up 2 bananas. Bananas are present with the IDs 1 and 5. We have to pick up 2 bananas, so let's pick both. Answer: [1, 5].`
  ),
  ...createExampleMessagePair(
    'What time is it?',
    `Let's think step by step. The user is not asking for any objects. Therefore, we don't need to pick up anything. Answer: [].`
  ),
  ...createExampleMessagePair(
    'Pick up two apples',
    `Let's think step by step. We have to pick up 2 apples. There is only 1 apple present with the ID of 0. To fulfill the user's request as much as possible, we should pick up that apple. Answer: [0].`
  )
]

export const cotInconsistentShots = [
  ...createExampleMessagePair(
    'Pick up the apple.',
    '"The apple" implies one apple. An apple is present with an ID of 0. Answer: [0].'
  ),
  ...createExampleMessagePair(
    'Pick up the apple and a hat.',
    '"The apple" implies one apple, and "a hat" implies one hat. An apple is present with an ID of 0, and a hat is present with an ID of 3. Answer: [0, 3].'
  ),
  ...createExampleMessagePair(
    'Give me a fruit.',
    "In the list of objects, there are multiple fruits: apples and bananas. Apples and bananas have the IDs of 0, 1 and 5. Let's pick the first one for consistency. Answer: [0]."
  ),
  ...createExampleMessagePair(
    'Give me some bananas.',
    '"Some bananas" implies more than one banana. Bananas are present with IDs of 1 and 5. Answer: [1, 5].'
  ),
  ...createExampleMessagePair(
    'What time is it?',
    'The user is not asking for any objects. Answer: [].'
  )
]
