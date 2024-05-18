import { algCotFewshotAlt } from '../algorithms/alg-cot-fewshot-alt.js'
import { algCotFewshot } from '../algorithms/alg-cot-fewshot.js'
import { algCotZeroshot } from '../algorithms/alg-cot-zeroshot.js'
import { algFewshot } from '../algorithms/alg-fewshot.js'
import { algCotFewshotAltWithPrecheck } from '../algorithms/alg-cot-fewshot-alt-with-precheck.js'
import { algFewshotWithPrecheck } from '../algorithms/alg-fewshot-with-precheck.js'
import { algZeroshotWithPrecheck } from '../algorithms/alg-zeroshot-with-precheck.js'
import { algPanelgptZeroshot } from '../algorithms/alg-panelgpt-zeroshot.js'
import { algZeroshotNoAnswerPrefix } from '../algorithms/alg-zeroshot-no-answer-prefix.js'
import { algZeroshot } from '../algorithms/alg-zeroshot.js'

export const algorithms = [
  algCotFewshotAlt,
  algCotFewshot,
  algCotZeroshot,
  algFewshot,
  algCotFewshotAltWithPrecheck,
  algFewshotWithPrecheck,
  algZeroshotWithPrecheck,
  algPanelgptZeroshot,
  algZeroshot,
  algZeroshotNoAnswerPrefix
]
