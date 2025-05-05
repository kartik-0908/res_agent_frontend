'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

type AgentDelta = {
  type: string;
  research_urls?: Array<{
    url: string;
    title: string;
    favicon: string;
  }>;
  [key: string]: any;
};

const allowedTypes = [
  'planning_for_research',
  'section_with_web_research',
  'searching_harrison',
  'gather_completed_sections',
  'writing_remaining_report',
  // 'still_previous',
];

export function ResAgentStreamHandler({ id }: { id: string }) {
  const { data } = useChat({ id });
  const [steps, setSteps] = useState<AgentDelta[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [completedTime, setCompletedTime] = useState<number | null>(null);
  const lastIndex = useRef(-1);
  const listRef = useRef<HTMLUListElement>(null);
  // Add ref to track URLs that are currently being fetched
  const fetchingUrls = useRef<Set<string>>(new Set());

  const researchComplete = steps.some((step) => step.type === 'writing_remaining_report');

  useEffect(() => {
    if (steps.length === 0) return;
    if (researchComplete) {
      if (completedTime === null) setCompletedTime(timer);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [steps.length, researchComplete]);

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
      <Card className="w-full max-w-xl transition-transform duration-200 ">
        <CardHeader className='pt-1 pb-1'>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Research Agent Steps
              <span className="ml-3 flex items-center gap-2">
                {!researchComplete ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs px-3 py-1 font-semibold">
                    Agent is researching for {timer} seconds now
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 text-xs font-bold border border-green-300">
                    Research complete in {completedTime ?? timer} seconds
                  </span>
                )}
              </span>
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setExpanded((prev) => !prev)}>
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className='pt-0'>

          {expanded && (
            <ul
              ref={listRef}
              className="relative list-none space-y-0 text-sm mt-4 max-h-64 overflow-y-auto pr-2"
              style={{ transition: 'max-height 0.2s' }}
            >
              {steps
                .filter((step) => allowedTypes.includes(step.type))
                .map((step, i) => (
                  <li key={i} className="flex relative">
                    {/* Step content */}
                    <div className="flex-1 ml-0 mb-4 z-10">
                      <div className="flex flex-col gap-1">
                        {/* Step UI */}
                        {step.type === 'planning_for_research' ? (
                          <div>
                            <div className="font-semibold text-xs text-gray-500 mb-1">Planning research</div>
                            <div className="italic text-gray-500">
                              Agent is planning the research...
                            </div>
                          </div>
                        ) : step.type === 'section_with_web_research' && Array.isArray(step.research_urls) ? (
                          <div>
                            <div className="font-semibold text-xs text-gray-500 mb-1">Navigating web</div>
                            {step.research_urls.length === 0 ? (
                              <div className="italic text-gray-500">Searching the web for relevant content...</div>
                            ) : (
                              <ul className="list-disc list-inside space-y-1">
                                {step.research_urls
                                  .map((urlItem, idx) => {
                                    return (
                                      <li
                                        key={idx}
                                        className="transition-all duration-200 bg-gray-700 border rounded-full px-3 py-2 flex items-center gap-2 max-w-xs cursor-pointer hover:scale-105 hover:shadow-md"
                                        title={urlItem.title}
                                        style={{ overflow: 'hidden' }}
                                      >
                                        <a
                                          href={urlItem.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 w-full"
                                          style={{ textDecoration: 'none' }}
                                        >
                                          <img
                                            src={urlItem.favicon}
                                            alt="favicon"
                                            className="w-4 h-4 flex-shrink-0"
                                          />
                                          <span className="block text-gray-400 font-medium" style={{ maxWidth: 300 }}>
                                            {urlItem.title}
                                          </span>
                                        </a>
                                      </li>
                                    )
                                  })}
                              </ul>
                            )}
                          </div>
                        ) : step.type === 'writing_remaining_report' ? (
                          <div>
                            <div className="font-semibold text-xs text-gray-500 mb-1">Writing report</div>
                            <div className="italic text-gray-500">
                              Agent is writing the final report...
                            </div>
                          </div>
                        ) : step.type === 'searching_harrison' ? (
                          <div>
                            <div className="font-semibold text-xs text-gray-500 mb-1">Searching Harrison</div>
                            <div className="italic text-gray-500">
                              Searching Harrison for relevant information...
                            </div>
                          </div>
                        ) : step.type === 'gather_completed_sections' ? (
                          <div>
                            <div className="font-semibold text-xs text-gray-500 mb-1">Gathering sections</div>
                            <div className="italic text-gray-500">
                              Gathering completed sections...
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-semibold text-xs text-gray-500 mb-1">{step.type.replace(/_/g, ' ')}</div>
                            <div className="italic text-gray-500">
                              {step.type.replace(/_/g, ' ')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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

function CircularTimer({ seconds }: { seconds: number }) {
  const radius = 16;
  const stroke = 4;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = (seconds % 60) / 60;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <svg height={radius * 2} width={radius * 2} className="block" style={{ display: 'block' }}>
      <circle
        stroke="#d1fae5"
        fill="#f0fdf4"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="#10b981"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s linear' }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize="12"
        fill="#047857"
        fontFamily="monospace"
        fontWeight="bold"
      >
        {seconds}
      </text>
    </svg>
  );
}