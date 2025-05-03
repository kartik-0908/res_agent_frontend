'use client';
import React, { createContext, useContext, useState } from 'react';

export type Step = { type: string; content: string };

const StreamedStepsContext = createContext<{
  steps: Step[];
  addStep: (step: Step) => void;
}>({
  steps: [],
  addStep: () => {},
});

export function StreamedStepsProvider({ children }: { children: React.ReactNode }) {
  const [steps, setSteps] = useState<Step[]>([]);
  const addStep = (step: Step) => setSteps((prev) => [...prev, step]);
  return (
    <StreamedStepsContext.Provider value={{ steps, addStep }}>
      {children}
    </StreamedStepsContext.Provider>
  );
}

export function useStreamedSteps() {
  return useContext(StreamedStepsContext);
}