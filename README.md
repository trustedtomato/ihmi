# LLM

## Development

### Setup

1. Use Node.JS 20 (I recommend nvm) and pnpm (after Node.JS is installed, using `npm i -g pnpm`)
2. Run `pnpm install`
3. Install ollama from https://github.com/trustedtomato/ollama (until https://github.com/ollama/ollama/pull/2404 gets merged)
   - See this page for installation guidance: https://github.com/trustedtomato/ollama/blob/main/docs/development.md
4. For developing GBNF in Visual Studio Code, install https://marketplace.visualstudio.com/items?itemName=iddar.gbnf-highlighter

### Running the tests

1. Run ollama by going into its directory and running `./ollama serve`
   - Sometimes Ollama server crashes. To restart Ollama in case of a crash, run `while true; do ./ollama serve && break || sleep 1; done` instead of just ollama serve
2. Run `npm run test`

### Important files

In order to have a good understanding of the codebase, it is recommended to read the following files:

- The test suite runner: `src/tests/index.ts`
- One of the simpler algorithms, for example: `src/algorithms/alg-cot-zeroshot.ts`
