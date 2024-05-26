export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface WorldCoordinates {
  x: number
  y: number
  z: number
}

export interface DatasetObject {
  label: string
  confidence: number
  trackingId: number
  boundingBox: BoundingBox
  worldCoordinates: WorldCoordinates
}
