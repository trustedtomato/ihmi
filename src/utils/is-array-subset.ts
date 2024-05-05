export function isArraySubset<T>(source: T[], subset: T[]) {
  if (subset.length > source.length) return false

  const src = [...source] // copy to omit changing an input source
  for (let i = 0; i < subset.length; i++) {
    const index = src.indexOf(subset[i])
    if (index !== -1) {
      src.splice(index, 1)
    } else {
      return false
    }
  }
  return true
}
