import chalk from 'chalk'
import { ActualDatasetObject } from './datasets/ActualDatasetObject.js'
import { datasets } from './datasets/index.js'
import { tests } from './tests/index.js'
import { algorithms } from './algorithms.js'
import fs from 'fs'
import { defaults } from '../utils/chat.js'
import { runWithRetry } from '../utils/run-with-retry.js'
import { logLine } from '../utils/log-debug.js'
import { execa } from 'execa'

const tries = 10

const models = ['phi3', 'llama3']

// We want to keep track of the last result in case the tests were interrupted
let lastResultIndices: {
  model: number
  dataset: number
  test: number
  algorithm: number
} | null = null

if (fs.existsSync('results.json')) {
  const lines = fs.readFileSync('results.json', 'utf8').split('\n')
  const lastLine = lines[lines.length - 1]
  if (lastLine.endsWith(']')) {
    // If the last line is an array closing bracket, it means the tests were
    // finished successfully, so we need to rename the file to keep the results,
    // and then start a new results.json file.
    for (let i = 2; ; i++) {
      if (fs.existsSync(`results-${i}.json`)) {
        continue
      }
      logLine(`Renaming results.json to results-${i}.json`)
      fs.renameSync('results.json', `results-${i}.json`)
    }
  } else if (lastLine.startsWith('[')) {
    // If the last line is an array opening bracket, it means the tests were
    // interrupted in the very beginning, so we can just delete the file.
    fs.unlinkSync('results.json')
  } else {
    // If the last line is a JSON object, it means the tests were interrupted
    // in the middle, so we want to start from that point.
    const lastResult = JSON.parse(lastLine)
    lastResultIndices = {
      model: models.indexOf(lastResult.model),
      dataset: datasets.findIndex(
        (dataset) => dataset.label === lastResult.dataset
      ),
      test: tests.findIndex((test) => test.prompt === lastResult.test),
      algorithm: algorithms.findIndex(
        (algorithm) => algorithm.name === lastResult.algorithm
      )
    }
  }
}

// Start the results array if it doesn't exist yet
if (!lastResultIndices) {
  fs.writeFileSync('results.json', '[')
}
let first = !lastResultIndices

for (const [modelIndex, model] of Object.entries(models)) {
  // We'll skip the models until we reach the last result. Then we reset
  // lastResultIndices to null to start running from that point.
  if (lastResultIndices && +modelIndex < lastResultIndices.model) {
    continue
  }
  defaults.model = model
  logLine(chalk.bgYellow.whiteBright.bold(` Model: ${model} `))
  for (const [datasetIndex, dataset] of Object.entries(datasets)) {
    if (lastResultIndices && +datasetIndex < lastResultIndices.dataset) {
      continue
    }
    logLine(chalk.bgRed.whiteBright.bold(' Dataset '))
    logLine(dataset)
    for (const [testIndex, test] of Object.entries(tests)) {
      if (lastResultIndices && +testIndex < lastResultIndices.test) {
        continue
      }
      logLine(chalk.bgGreen.whiteBright.bold(' Prompt '))
      logLine(test.prompt)
      for (const [algorithmIndex, algorithm] of Object.entries(algorithms)) {
        if (
          lastResultIndices &&
          +algorithmIndex < lastResultIndices.algorithm
        ) {
          continue
        }
        // If we got this far, it means we reached the last result, and we want
        // to start the run now from this place, so we reset lastResultIndices.
        // Note that this means this test case will be run more than "tries"
        // times, but that's fine. We can just ignore the extra results.
        if (lastResultIndices) {
          lastResultIndices = null
        }
        logLine(chalk.bgBlue.whiteBright.bold(` Algorithm: ${algorithm.name} `))
        for (let i = 0; i < tries; i++) {
          logLine(chalk.bgMagenta.whiteBright.bold(` Try #${+(i + 1)} `))
          const start = performance.now()
          // In case Ollama server is down, for example, we want to keep trying.
          const result = await runWithRetry(
            async () => await algorithm(dataset.items, test.prompt),
            {
              retries: Infinity,
              retryDelay: 1000,
              timeout: 60 * 1000,
              timeoutFn: async () => {
                logLine('Timeout')
                // We need to kill the Ollama server in case it's stuck
                await execa`pkill -9 ollama`
                throw new Error('Timeout')
              }
            }
          )
          const score = result.fold(
            () => 0,
            (objects) =>
              test.score(objects as ActualDatasetObject[], dataset.items)
          )
          const end = performance.now()
          logLine(`Score: ${score}`)
          const item = {
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
          }
          if (first) {
            fs.appendFileSync('results.json', JSON.stringify(item))
            first = false
          } else {
            fs.appendFileSync('results.json', ',\n' + JSON.stringify(item))
          }
        }
      }
    }
  }
}
fs.appendFileSync('results.json', ']')
