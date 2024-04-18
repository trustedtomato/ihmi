import chalk from 'chalk'
import { ActualDatasetObject } from './datasets/ActualDatasetObject.js'
import { datasets } from './datasets/index.js'
import { tests } from './tests/index.js'
import { algorithms } from './algorithms.js'

const tries = 5

for (const dataset of datasets) {
  console.log(chalk.bgRed.whiteBright.bold(' Dataset '))
  console.log(dataset)
  for (const test of tests) {
    console.log(chalk.bgGreen.whiteBright.bold(' Prompt '))
    console.log(test.prompt)
    for (const algorithm of algorithms) {
      console.log(chalk.bgBlue.whiteBright.bold(` Algorithm: ${algorithm.name} `))
      for (let i = 0; i < tries; i++) {
        console.log(chalk.bgMagenta.whiteBright.bold(` Try #${ + (i + 1)} `))
        const result = await algorithm(dataset, test.prompt)
        const score = result.fold(
          () => 0,
          (objects) => test.score(objects as ActualDatasetObject[])
        )
        console.log(`Score: ${score}`)
      }
    }
  }
}
