'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

type AgentDelta = {
  type: string;
  research_urls?: string[];
  [key: string]: any;
};

type UrlMeta = {
  title: string;
  favicon: string;
};

const allowedTypes = [
  'planning_for_research',
  'section_with_web_research',
  'searching_harrison',
  'gather_completed_sections',
  'writing_remaining_report',
];

// Helper to fetch title and favicon
async function fetchUrlMeta(url: string): Promise<UrlMeta> {
  try {
    const res = await fetch(`/api/url-meta?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    return {
      title: data.title ,
      favicon: data.favicon || `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`,
    };
  } catch (error){
    console.log('Failed to fetch title and favicon for URL:', error);
    return {
      title: url,
      favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`,
    };
  }
}

export function ResAgentStreamHandler({ id }: { id: string }) {
  const { data } = useChat({ id });
  const [steps, setSteps] = useState<AgentDelta[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [urlMeta, setUrlMeta] = useState<Record<string, UrlMeta>>({});
  const lastIndex = useRef(-1);
  const listRef = useRef<HTMLUListElement>(null);

  // Fetch meta for new URLs
  useEffect(() => {
    const urls: string[] = [];
    steps.forEach((step) => {
      if (step.type === 'section_with_web_research' && Array.isArray(step.research_urls)) {
        step.research_urls.forEach((url) => {
          if (!urlMeta[url]) urls.push(url);
        });
      }
    });
    if (urls.length) {
      urls.forEach(async (url) => {
        const meta = await fetchUrlMeta(url);
        setUrlMeta((prev) => ({ ...prev, [url]: meta }));
      });
    }
  }, [steps]);

  useEffect(() => {
    if (!data?.length) return;

    setLoading(true);
    const newItems = data.slice(lastIndex.current + 1) as AgentDelta[];
    lastIndex.current = data.length - 1;

    if (newItems.length) {
      setSteps((prev) => [...prev, ...newItems]);
    }
    setLoading(false);
  }, [data]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [steps, expanded]);

  if (steps.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="flex justify-center items-center p-4">
      <Card className="w-full max-w-xl transition-transform duration-200 hover:scale-105">
        <CardContent>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Agent Steps</h2>
            <Button variant="ghost" size="sm" onClick={() => setExpanded((prev) => !prev)}>
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
          {expanded && (
            <ul
              ref={listRef}
              className="list-none space-y-4 text-sm mt-4 max-h-64 overflow-y-auto pr-2"
              style={{ transition: 'max-height 0.2s' }}
            >
              {steps
                .filter((step) => allowedTypes.includes(step.type))
                .map((step, i) => (
                  <li key={i} className="p-3 rounded bg-muted flex flex-col gap-2">
                    <span className="inline-flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide">
                        {step.type}
                      </span>
                    </span>
                    {step.type === 'section_with_web_research' && Array.isArray(step.research_urls) && (
                      <div className="ml-2">
                        <div className="font-semibold text-xs text-gray-500 mb-1">Research URLs:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {step.research_urls.map((url: string, idx: number) => {
                            const meta = urlMeta[url];
                            return (
                              <li key={idx} className="flex items-center gap-2">
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-blue-600 underline break-all"
                                >
                                  <img
                                    src={meta?.favicon || `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`}
                                    alt="favicon"
                                    className="w-4 h-4"
                                  />
                                  <span>{meta?.title}</span>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              {loading && (
                <li className="flex justify-center items-center py-2">
                  <Loader2 className="animate-spin w-5 h-5 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Processing...</span>
                </li>
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}