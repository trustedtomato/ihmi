export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface DatasetObject {
  label: string
  boundingBox: BoundingBox
}