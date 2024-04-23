/**
 * Score a test based on how many aspects are fulfilled.
 */
export function getScore(aspects: ([boolean, number] | boolean)[]) {
  const normalizedAspects = aspects.map((aspect): [boolean, number] =>
    typeof aspect === 'boolean' ? [aspect, 1] : aspect
  )
  const max = normalizedAspects.reduce((sum, aspect) => sum + aspect[1], 0)
  return (
    normalizedAspects.reduce((sum, aspect) => sum + +aspect[0] * aspect[1], 0) /
    max
  )
}
