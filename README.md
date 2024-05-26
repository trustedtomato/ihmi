# LLM

## Development

### Setup

1. Use Node.JS 22 (I recommend installation via nvm) and pnpm (after Node.JS is installed, using `npm i -g pnpm`)
2. Run `pnpm install`
3. Install ollama from https://github.com/trustedtomato/ollama (until https://github.com/ollama/ollama/pull/2404 gets merged)
   - See this page for installation guidance: https://github.com/trustedtomato/ollama/blob/main/docs/development.md
4. For developing GBNF in Visual Studio Code, install https://marketplace.visualstudio.com/items?itemName=iddar.gbnf-highlighter

### Understanding the codebase

In order to have a good understanding of the codebase, it is recommended to start with the entry point of the test suite runner: [src/tests/index.ts](src/tests/index.ts). From there, you can explore the rest of the codebase by following the imports.

Some of the more interesting files include:

- The test suite runner: [src/tests/index.ts](src/tests/index.ts)
- The ROS node: [src/rosnode.ts](src/rosnode.ts)
- One of the simpler algorithms, for example: [src/algorithms/alg-cot-zeroshot.ts](src/algorithms/alg-cot-zeroshot.ts)
- The utility function called chat, which provides an abstraction over the Ollama API: [src/utils/chat.ts](src/utils/chat.ts)
- The base definitions for the output grammars: [src/utils/grammars.gbnf](src/utils/grammars.gbnf)
  - To check how it is used to create a grammar, see [src/algorithms/alg-cot-zeroshot.ts](src/algorithms/alg-cot-zeroshot.ts)

### Running the tests

1. Run ollama by going into its directory and running `while true; do ./ollama serve > /dev/null 2>&1 || sleep 1; done`
   - The script makes sure to restart the Ollama server in case of a crash, which does happen sometimes
   - The script also suppresses the output of the Ollama server, which could
     potentially be very verbose and affect the performance metrics of the test
     suite. For development though, you could remove it, in which case you'd
     want to remove the `> /dev/null 2>&1` part of the command
2. Run `npm run test`
   - You can run `DEBUG="app:test,app:test:*" npm run test` to see the test suite output
   - You can run `DEBUG="app:*" npm run test` to see the test suite output and the debugging output of all other parts of the codebase
   - To run the test suite multiple times, you could use `while true; do npm run test; done`
