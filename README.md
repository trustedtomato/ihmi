# LLM

## Development

### Setup

1. Use Node.JS 20 (I recommend nvm) and pnpm (after Node.JS is installed, using `npm i -g pnpm`)
2. Run `pnpm install`
3. Install ollama from https://github.com/trustedtomato/ollama (until https://github.com/ollama/ollama/pull/2404 gets merged)
   - See this page for installation guidance: https://github.com/trustedtomato/ollama/blob/main/docs/development.md
4. For developing GBNF in Visual Studio Code, install https://marketplace.visualstudio.com/items?itemName=iddar.gbnf-highlighter

### Running the setup

1. Run ollama by going into its directory and running `./ollama serve`
2. Run `npm run test`

## Potential LLMs

- https://huggingface.co/TheBloke/WizardCoder-Python-7B-V1.0-GGUF
  - https://ollama.com/library/wizardcoder
- https://huggingface.co/TheBloke/stable-code-3b-GGUF
  - https://ollama.com/library/stable-code
- https://ollama.com/library/mistral
