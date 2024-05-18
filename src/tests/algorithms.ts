import { algCotFewshotAlt } from '../algorithms/alg-cot-fewshot-alt.js'
import { algCotFewshot } from '../algorithms/alg-cot-fewshot.js'
import { algCotZeroshot } from '../algorithms/alg-cot-zeroshot.js'
import { algFewshot } from '../algorithms/alg-fewshot.js'
import { algSplitCotFewshotAlt } from '../algorithms/alg-split-cot-fewshot-alt.js'
import { algSplitFewshot } from '../algorithms/alg-split-fewshot.js'
import { algSplitZeroshot } from '../algorithms/alg-split-zeroshot.js'
import { algTotZeroshot } from '../algorithms/alg-tot-zeroshot.js'
import { algZeroshotNoAnswerPrefix } from '../algorithms/alg-zeroshot-no-answer-prefix.js'
import { algZeroshot } from '../algorithms/alg-zeroshot.js'

export const algorithms = [
  algCotFewshotAlt,
  algCotFewshot,
  algCotZeroshot,
  algFewshot,
  algSplitCotFewshotAlt,
  algSplitFewshot,
  algSplitZeroshot,
  algTotZeroshot,
  algZeroshot,
  algZeroshotNoAnswerPrefix
]
