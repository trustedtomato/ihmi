/**
 * Score a test based on how many aspects are fulfilled.
 */
export function getScore(aspects: [boolean, number][]) {
  const max = aspects.reduce((sum, aspect) => sum + aspect[1], 0)
  return aspects.reduce((sum, aspect) => sum + +aspect[0] * aspect[1], 0) / max
}
