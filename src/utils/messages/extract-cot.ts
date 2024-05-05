import { stripIndents } from 'common-tags'

// SYSTEM MESSAGES
export const extractCotSystemMessage = {
  role: 'system',
  content: stripIndents`
    Extract the object IDs from the user prompt.
    The answer should be a JSON array of object IDs.
  `
}

// SHOTS
export const extractCotShots = [
  {
    role: 'user',
    content:
      '"Some bananas" implies more than one banana. Bananas are present with IDs of 1 and 5. Answer: [1, 5].'
  },
  {
    role: 'assistant',
    content: '{"answer": [1, 5]}'
  },
  {
    role: 'user',
    content:
      '"The apple" implies one apple. An apple is present with an ID of 0. Answer: [0].'
  },
  {
    role: 'assistant',
    content: '{"answer": [0]}'
  }
]
