import type { DatasetObject } from './DatasetObject.js'

const dataset1 = [
  {
    label: 'tennis ball',
    boundingBox: {
      x: 0.1,
      y: 0.2,
      width: 0.3,
      height: 0.4
    }
  },
  {
    label: 'scissors',
    boundingBox: {
      x: 0.5,
      y: 0.6,
      width: 0.7,
      height: 0.8
    }
  },
  {
    label: 'paper towel',
    boundingBox: {
      x: 0.9,
      y: 0.1,
      width: 0.2,
      height: 0.3
    }
  },
  {
    label: 'banana',
    boundingBox: {
      x: 0.4,
      y: 0.5,
      width: 0.6,
      height: 0.7
    }
  },
  {
    label: 'banana',
    boundingBox: {
      x: 0.8,
      y: 0.9,
      width: 0.1,
      height: 0.2
    }
  },
  {
    label: 'apple',
    boundingBox: {
      x: 0.1,
      y: 0.2,
      width: 0.3,
      height: 0.4
    }
  },
  {
    label: 'mango',
    boundingBox: {
      x: 0.5,
      y: 0.6,
      width: 0.7,
      height: 0.8
    }
  },
  {
    label: 'apple',
    boundingBox: {
      x: 0.9,
      y: 0.1,
      width: 0.2,
      height: 0.3
    }
  },
  {
    label: 'apple',
    boundingBox: {
      x: 0.4,
      y: 0.5,
      width: 0.6,
      height: 0.7
    }
  },
  {
    label: 'tennis ball',
    boundingBox: {
      x: 0.8,
      y: 0.9,
      width: 0.1,
      height: 0.2
    }
  }
] as const satisfies DatasetObject[]

export const datasets = [dataset1] as const
