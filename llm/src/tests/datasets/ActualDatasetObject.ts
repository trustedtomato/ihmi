import { datasets } from './index.js'

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never

export type ActualDatasetObject = ArrayElement<
  ArrayElement<typeof datasets>['items']
>
