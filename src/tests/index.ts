import chalk from 'chalk'
import { ActualDatasetObject } from './datasets/ActualDatasetObject.js'
import { datasets } from './datasets/index.js'
import { tests } from './tests/index.js'
import { algorithms } from './algorithms.js'
import fs from 'fs'
import { defaults } from '../utils/chat.js'

const tries = 10

const models = ['phi3']

const results: {
  dataset: string
  test: string
  algorithm: string
  score: number
  time: number
  model: string
  result: string
}[] = []

for (const model of models) {
  defaults.model = model
  console.log(chalk.bgYellow.whiteBright.bold(` Model: ${model} `))
  for (const dataset of datasets) {
    console.log(chalk.bgRed.whiteBright.bold(' Dataset '))
    console.log(dataset)
    for (const test of tests) {
      console.log(chalk.bgGreen.whiteBright.bold(' Prompt '))
      console.log(test.prompt)
      for (const algorithm of algorithms) {
        console.log(
          chalk.bgBlue.whiteBright.bold(` Algorithm: ${algorithm.name} `)
        )
        for (let i = 0; i < tries; i++) {
          console.log(chalk.bgMagenta.whiteBright.bold(` Try #${+(i + 1)} `))
          const start = performance.now()
          const result = await algorithm(dataset.items, test.prompt)
          const score = result.fold(
            () => 0,
            (objects) =>
              test.score(objects as ActualDatasetObject[], dataset.items)
          )
          const end = performance.now()
          console.log(`Score: ${score}`)
          results.push({
            dataset: dataset.label,
            test: test.prompt,
            algorithm: algorithm.name,
            score,
            time: end - start,
            model,
            result: result.fold(
              (error) => error,
              (objects) => JSON.stringify(objects)
            )
          })
          fs.writeFileSync('results.json', JSON.stringify(results))
        }
      }
    }
  }
}
