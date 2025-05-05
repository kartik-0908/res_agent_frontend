import { smoothStream, streamText } from 'ai';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { updateDocumentPrompt } from '@/lib/ai/prompts';
import { azure } from '@/lib/ai/azure';

export const textDocumentHandler = createDocumentHandler<'text'>({
  kind: 'text',
  onCreateDocument: async ({ title, supportingContent, dataStream }) => {
    let draftContent = '';

    const prompt = `${title}\n\n  findings of the research agent :${supportingContent}`

    console.log('prompt for creating document: ', prompt);

    const { fullStream } = streamText({
      model: azure('o1'),
      system:
        'Write about the given topic. Markdown is supported. Use headings wherever appropriate. use findings of research agent to create the document. Strictly include references given in the supported content ',
      experimental_transform: smoothStream({ chunking: 'word' }),
      prompt: prompt,
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'text-delta') {
        const { textDelta } = delta;

        draftContent += textDelta;

        dataStream.writeData({
          type: 'text-delta',
          content: textDelta,
        });
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';
    const prompt = updateDocumentPrompt(document.content, 'text')
    console.log('prompt for updating document: ', prompt);

    const { fullStream } = streamText({
      model: azure('o1'),
      system: prompt,
      experimental_transform: smoothStream({ chunking: 'word' }),
      prompt: description,
      experimental_providerMetadata: {
        openai: {
          prediction: {
            type: 'content',
            content: document.content,
          },
        },
      },
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'text-delta') {
        const { textDelta } = delta;

        draftContent += textDelta;
        dataStream.writeData({
          type: 'text-delta',
          content: textDelta,
        });
      }
    }

    return draftContent;
  },
});
