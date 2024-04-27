import type { DatasetObject } from './DatasetObject.js'

const dataset1Src = {
  label: 'dataset1',
  items: [
    'tennis ball',
    'scissors',
    'paper towel',
    'banana',
    'banana',
    'apple',
    'mango',
    'apple',
    'apple',
    'tennis ball'
  ]
} as const

const dataset2Src = {
  label: 'dataset2',
  items: [
    'apple',
    'banana',
    'newspaper',
    'potato',
    'cucumber',
    'banana',
    'apple',
    'banana'
  ]
} as const

export const datasets = [dataset1Src, dataset2Src].map((dataset) => ({
  label: dataset.label,
  items: dataset.items.map((item, index) => ({
    label: item,
    confidence: 0.9,
    trackingId: index,
    boundingBox: {
      x: 0,
      y: 0,
      width: 1,
      height: 1
    }
  })) satisfies DatasetObject[]
}))
