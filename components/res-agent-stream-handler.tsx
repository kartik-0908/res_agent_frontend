'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Clock, Loader2 } from 'lucide-react';
import { ResThinkingMessage, ThinkingMessage } from './message';
import { useLocalStorage } from '@/hooks/storeTime';

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
  const [timer, setTimer] = useState<number>(
    () => Number(window.localStorage.getItem(`research-timer-${id}`)) || 0
  );

  const [completedTime, setCompletedTime] = useLocalStorage<number | null>(`research-completed-time-${id}`, null);
  const lastIndex = useRef(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState(0);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [researchCompleteFlag, setResearchCompleteFlag] = useLocalStorage<boolean>(`research-complete-${id}`, false);
  const [loadedSteps, setLoadedSteps] = useLocalStorage<AgentDelta[]>(`research-steps-${id}`, []);


  const researchComplete = researchCompleteFlag || steps.some((step) => step.type === 'writing_remaining_report');

  useEffect(() => {
    if (steps.length === 0 || researchComplete) return;
    const interval = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [steps.length, researchComplete]);

  useEffect(() => {
    if (!researchComplete) return;
    window.localStorage.setItem(`research-timer-${id}`, String(timer));
    setCompletedTime(timer);
  }, [researchComplete, timer, id, setCompletedTime]);

  useEffect(() => {
    // On first mount, restore any saved steps
    if (steps.length === 0 && loadedSteps.length > 0) {
      setSteps(loadedSteps);
      // Set lastIndex to avoid reprocessing these steps
      lastIndex.current = loadedSteps.length - 1;
    }
  }, [loadedSteps]);


  useEffect(() => {
    if (!data?.length) return;

    setLoading(true);
    const newItems = data.slice(lastIndex.current + 1) as AgentDelta[];
    const hasNewItems = newItems.length > 0;
    lastIndex.current = data.length - 1;

    if (hasNewItems) {
      const updatedSteps = [...steps, ...newItems];
      setSteps(updatedSteps);

      // Save steps to localStorage
      setLoadedSteps(updatedSteps);

      // Only auto-scroll if new items were added and user hasn't manually scrolled
      if (!userHasScrolled && listRef.current) {
        setTimeout(() => {
          if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
          }
        }, 10);
      }
    }
    setLoading(false);
  }, [data, userHasScrolled, steps, setLoadedSteps]);

  const [scrollPosition, setScrollPosition] = useState(0);

  // Handle user scroll interaction
  const handleScroll = () => {
    if (!listRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 5;
    setScrollPosition(scrollTop);

    // If user has scrolled up from bottom
    if (!isAtBottom) {
      setUserHasScrolled(true);
    } else {
      // If user scrolled back to bottom, reset the flag
      setUserHasScrolled(false);
    }
  };

  useEffect(() => {
    if (listRef.current && scrollPosition > 0) {
      listRef.current.scrollTop = scrollPosition;
    }
  }, [expanded]);

  // Only auto-scroll when expanded state changes if user hasn't scrolled up
  useEffect(() => {
    if (expanded && !userHasScrolled && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [expanded, userHasScrolled]);

  if (steps.length === 0 && !loading) {
    return <ResThinkingMessage />;
  }

  return (
    <div className="flex justify-center items-center p-2 sm:p-4">
      <Card className="w-full max-w-full sm:max-w-xl transition-transform duration-200">
        <CardHeader className="px-2 py-2 sm:px-4 sm:py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h2 className="text-base sm:text-lg font-semibold">Research Agent</h2>
              {!researchComplete ? (
                <div className="flex items-center gap-1 sm:gap-2 min-w-[120px]">
                  <div className="relative h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"></div>
                  </div>
                  <span
                    className="text-xs sm:text-sm font-medium whitespace-nowrap"
                    style={{
                      backgroundImage: `linear-gradient(
                        90deg, 
                        rgba(59, 130, 246, 0.7) ${position - 5}%, 
                        rgba(59, 130, 246, 1) ${position}%, 
                        rgba(59, 130, 246, 0.7) ${position + 5}%
                      )`,
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      backgroundSize: '100% 100%',
                    }}
                  >
                    Researching ({timer}s)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-xs sm:text-sm font-medium text-green-600">
                    Done in {completedTime ?? timer}s
                  </span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded((prev) => !prev)}
              className="p-1 hover:bg-zinc-100 rounded-md"
            >
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {expanded && (
            <ul
              ref={listRef}
              className="relative list-none space-y-0 text-sm mt-4 max-h-56 sm:max-h-64 overflow-y-auto pr-1 sm:pr-2"
              style={{ transition: 'max-height 0.2s' }}
              onScroll={handleScroll}
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
                              Agent is currently planning the research...
                            </div>
                          </div>
                        ) : step.type === 'section_with_web_research' && Array.isArray(step.research_urls) ? (
                          <div>
                            <div className="font-semibold text-xs text-gray-500 mb-1">Navigating web</div>
                            {step.research_urls.length === 0 ? (
                              <div className="italic text-gray-500">Searching the web for relevant content...</div>
                            ) : (
                              <ul className="list-disc list-inside space-y-1">
                                {step.research_urls.map((urlItem, idx) => (
                                  <li
                                    key={idx}
                                    className="transition-all duration-200 
                                      bg-gray-100 border border-gray-200 
                                      dark:bg-gray-700 dark:border-gray-600 
                                      rounded-full px-3 py-2 flex items-center gap-2 max-w-full sm:max-w-xs cursor-pointer 
                                      hover:scale-105 hover:shadow-md"
                                    title={urlItem.title}
                                    style={{ overflow: 'hidden' }}
                                  >
                                    <a
                                      href={urlItem.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 w-full min-w-0"
                                      style={{ textDecoration: 'none' }}
                                    >
                                      <img
                                        src={urlItem.favicon || '/favicon.ico'}
                                        alt="favicon"
                                        className="w-4 h-4 flex-shrink-0"
                                      />
                                      <span className="block text-gray-500 dark:text-gray-300 text-xs font-medium truncate max-w-[140px] sm:max-w-[200px]">
                                        {urlItem.title.split(' ').slice(0, 6).join(' ')}
                                        {urlItem.title.split(' ').length > 6 ? '...' : ''}
                                      </span>
                                    </a>
                                  </li>
                                ))}
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
                            <div className="font-semibold text-xs text-gray-500 mb-1">Searching relavant textbooks</div>
                            <div className="italic text-gray-500">
                              Agent is currently researching from gold standard textbooks...
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
                  <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <span className="ml-2 text-xs sm:text-sm text-muted-foreground">Processing...</span>
                </li>
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

