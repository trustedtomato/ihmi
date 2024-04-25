import results from './results-1.json'

const algos = Object.groupBy(results, (result) => result.algorithm)
Object.entries(algos).map(([algo, results]) => {
  console.log(
    algo,
    results?.reduce((acc, result) => acc + result.score, 0)
  )
})
