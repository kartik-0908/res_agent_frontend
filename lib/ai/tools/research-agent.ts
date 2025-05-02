// lib/ai/tools/research-agent.ts
import { z } from 'zod';
import { DataStreamWriter, tool } from 'ai';

interface ResearchAgentProps {
  dataStream: DataStreamWriter;
}

export const researchAgent = ({ dataStream }: ResearchAgentProps) =>
  tool({
    description:
      'Generate an in-depth research report on a given topic by calling the backend research agent service.',
    parameters: z.object({
      topic: z.string().describe('The topic to research'),
    }),
    execute: async ({ topic }) => {
      const res = await fetch(
        `${process.env.RESEARCH_AGENT_URL}/chat/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({ message: topic }),
        }
      );

      if (!res.ok || !res.body) {
        throw new Error(`Research agent error: ${res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';
      let fullReport = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (!value) continue;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          if (part.startsWith('data:')) {
            const payload = JSON.parse(part.replace(/^data:\s*/, ''));
            const chunk = payload.chunk as string;

            // ←—— LOG IT HERE:
            console.log('[researchAgent] new chunk:', chunk);

            fullReport += chunk;
            dataStream.writeData({ type: 'title', content: chunk });
          }
        }
      }

      return { report: fullReport };
    },
  });
