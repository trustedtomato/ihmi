export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface DatasetObject {
  label: string
  confidence: number
  trackingId: number
  boundingBox: BoundingBox
}
