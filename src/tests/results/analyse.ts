import { stripIndent } from 'common-tags'
import { tryCatch } from '../../utils/try-catch.js'
import type resultsType from './results-8.json'

const resultsFile = process.argv[2]
const results = (await import(resultsFile || './results.json'))
  .default as typeof resultsType

/*
[{"dataset":"dataset1","test":"Pick up a banana","algorithm":"algCotFewshotAlt","score":1,"time":17379.076609000003,"model":"llama3","result":"[{\"label\":\"banana\",\"confidence\":0.9,\"trackingId\":0,\"boundingBox\":{\"x\":0,\"y\":0,\"width\":1,\"height\":1}}]"},{"dataset":"dataset1","test":"Pick up a banana","algorithm":"algCotFewshotAlt","score":1,"time":12050.550459999999,"model":"llama3","result":"[{\"label\":\"banana\",\"confidence\":0.9,\"trackingId\":0,\"boundingBox\":{\"x\":0,\"y\":0,\"width\":1,\"height\":1}}]"},{"dataset":"dataset1","test":"Pick up a banana","algorithm":"algCotFewshotAlt","score":1,"time":11704.941046999997,"model":"llama3","result":"[{\"label\":\"banana\",\"confidence\":0.9,\"trackingId\":0,\"boundingBox\":{\"x\":0,\"y\":0,\"width\":1,\"height\":1}}]"},{"dataset":"dataset1","test":"Pick up a banana","algorithm":"algCotFewshotAlt","score":1,"time":11627.847504999998,"model":"llama3","result":"[{\"label\":\"banana\",\"confidence\":0.9,\"trackingId\":0,\"boundingBox\":{\"x\":0,\"y\":0,\"width\":1,\"height\":1}}]"},{"dataset":"dataset1","test":"Pick up a banana","algorithm":"algCotFewshotAlt","score":1,"time":11635.905437000001,"model":"llama3","result":"[{\"label\":\"banana\",\"confidence\":0.9,\"trackingId\":0,\"boundingBox\":{\"x\":0,\"y\":0,\"width\":1,\"height\":1}}]"}]
*/

// Let's find out how each test was scored, with the tests further grouped by algorithm, dataset and model.
const scores = results.reduce(
  (acc, { dataset, algorithm, model, test, score, result, time }) => {
    if (!acc[algorithm]) acc[algorithm] = {}
    if (!acc[algorithm][model]) acc[algorithm][model] = {}
    if (!acc[algorithm][model][dataset]) acc[algorithm][model][dataset] = {}
    if (!acc[algorithm][model][dataset][test])
      acc[algorithm][model][dataset][test] = {
        correctResponses: new Set(),
        correctVotes: 0,
        voting: {},
        time: 0
      }
    acc[algorithm][model][dataset][test].time += time
    // normalize the result to a sorted array of labels
    return tryCatch(() => JSON.parse(result)).fold(
      () => {
        console.log(
          stripIndent`
            CAN'T PARSE RESULT
            Dataset: ${dataset}
            Algorithm: ${algorithm}
            Model: ${model}
            Test: ${test}
            Result: ${result}
            Time: ${time}
          ` + '\n'
        )
        return acc
      },
      (parsedResult1) => {
        const parsedResult = JSON.stringify(
          parsedResult1 && parsedResult1?.map((r: any) => r.trackingId).sort()
        )
        // vote for the result
        acc[algorithm][model][dataset][test].voting[parsedResult] =
          (acc[algorithm][model][dataset][test].voting[parsedResult] || 0) + 1
        // if the score is 1, set it as the correct result
        if (score === 1) {
          acc[algorithm][model][dataset][test].correctResponses.add(
            parsedResult
          )
          acc[algorithm][model][dataset][test].correctVotes++
        }
        return acc
      }
    )
  },
  {} as any
)

const scoresAcc: any = {}

// Let's evaluate the voting results
Object.entries(scores).forEach(([algorithm, models]: any) => {
  Object.entries(models).forEach(([model, datasets]: any) => {
    Object.entries(datasets).forEach(([dataset, tests]: any) => {
      Object.entries(tests).forEach(
        ([test, { correctResponses, voting }]: any) => {
          // Get the most voted result
          const mostVoted = Object.entries(voting).reduce(
            (acc, [result, votes]: any) => {
              if (votes > acc.votes) {
                acc.votes = votes
                acc.result = result
              }
              return acc
            },
            { votes: 0, result: null }
          )
          const isVoteCorrect = correctResponses.has(mostVoted.result)
          if (!scoresAcc[algorithm]) scoresAcc[algorithm] = {}
          if (!scoresAcc[algorithm][model])
            scoresAcc[algorithm][model] = {
              correct: 0,
              total: 0,
              individualCorrect: 0,
              individualTotal: 0,
              timeTotal: 0
            }
          scoresAcc[algorithm][model].timeTotal += tests[test].time / 1000 / 420
          scoresAcc[algorithm][model].total++
          scoresAcc[algorithm][model].individualTotal += Object.values(
            voting
          ).reduce((acc: any, votes) => acc + votes, 0)
          if (isVoteCorrect) scoresAcc[algorithm][model].correct++
          else {
            if (algorithm === 'algSplitCotFewshotAlt' && model === 'llama3') {
              console.log(
                stripIndent`
              Dataset: ${dataset}
              Algorithm: ${algorithm}
              Model: ${model}
              Test: ${test}
              Votes: ${JSON.stringify(voting)}
            `
              )
              console.log()
            }
          }
          scoresAcc[algorithm][model].individualCorrect +=
            tests[test].correctVotes
        }
      )
    })
  })
})

console.log(scoresAcc)

// fs.writeFileSync('scores.json', JSON.stringify(scores, null, 2))
