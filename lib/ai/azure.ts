import { createAzure } from "@ai-sdk/azure";

export const azure = createAzure({
  resourceName: 'makai-azurespon', // Azure resource name
  apiKey: process.env.AZURE_OPENAI_API_KEY, // Azure OpenAI API key
});