export const exampleDataset1 = (
  [
    'apple', // 0
    'banana', // 1
    'tennis ball', // 2
    'hat', // 3
    'potato', // 4
    'banana' // 5
  ] as const
).map((label, index) => ({ label, id: index }))

export const exampleDataset2 = (
  [
    'mango', // 0
    'plates', // 1
    'book', // 2
    'pen', // 3
    'potato', // 4
    'apple', // 5
    'board game', // 6
    'cards' // 7
  ] as const
).map((label, index) => ({ label, id: index }))

export const exampleDataset3 = (
  [
    'banana', // 0
    'vase', // 1
    'ketchup', // 2
    'apple' // 3
  ] as const
).map((label, index) => ({ label, id: index }))
