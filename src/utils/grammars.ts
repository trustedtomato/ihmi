import fs from 'fs'

const jsonGrammarDefs = fs.readFileSync(
  new URL('./grammars.gbnf', import.meta.url),
  'utf8'
)

export const jsonRoot = `${jsonGrammarDefs}\nroot ::= `
