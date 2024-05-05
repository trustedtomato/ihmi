import { stripIndent } from 'common-tags'

const jsonGrammarDefs =
  stripIndent`
    ws ::= [ \\t\\n]*
    natint ::= ([0-9] | [1-9] [0-9]*)
    natintarray ::= "[" ws (posint ("," ws posint)*)? ws "]"
    string ::=
      "\\"" (
        [^"\\\\\\x7F\\x00-\\x1F] |
        "\\\\" (["\\\\/bfnrt] | "u" [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F]) # escapes
      )* "\\"" ws
    stringarray ::= "[" ws (string ("," ws string)*)? ws "]"
    answerprefix ::= "{" ws "\\"answer\\":" ws
    answerpostfix ::= ws "}"
  ` + '\n'

export const jsonRoot = `${jsonGrammarDefs}root ::= `
