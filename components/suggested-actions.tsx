'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { VisibilityType } from './visibility-selector';

interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers['append'];
  selectedVisibilityType: VisibilityType;
}

function PureSuggestedActions({
  chatId,
  append,
  selectedVisibilityType,
}: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: 'Outline the 2022 ACC/AHA/HFSA algorithm',
      label: 'for newly diagnosed HFrEF—in three crisp bullets.',
      action: 'Outline the 2022 ACC/AHA/HFSA algorithm for newly diagnosed HFrEF—in three crisp bullets.',
    },
    {
      title: 'What’s the Class I vs IIa guidance on DOACs versus',
      label: ` warfarin for non-valvular AF (ACC 2023)?`,
      action: `What’s the Class I vs IIa guidance on DOACs versus warfarin for non-valvular AF (ACC 2023)`,
    },
    {
      title: 'Compare STEMI vs NSTEMI dual-antiplatelet ',
      label: `duration rules from the 2022 ESC ACS update.`,
      action: `Compare STEMI vs NSTEMI dual-antiplatelet duration rules from the 2022 ESC ACS update.`,
    },
    {
      title: 'List the high-risk features that trigger early',
      label: 'TAVI referral in asymptomatic severe AS (latest ACC)',
      action: 'List the high-risk features that trigger early TAVI referral in asymptomatic severe AS (latest ACC).',
    },
  ];

  return (
    <div
      data-testid="suggested-actions"
      className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, '', `/chat/${chatId}`);

              append({
                role: 'user',
                content: suggestedAction.action,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;

    return true;
  },
);