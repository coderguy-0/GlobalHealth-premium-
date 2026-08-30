import React, { useEffect, useState } from 'react';
import { AIAvatar } from './AIAvatar';
import { AIGreetingBubble } from './AIGreetingBubble';

interface GlobalHealthAIAssistantProps {
  onOpen: () => void;
}

const GREETING_STORAGE_KEY = 'assistantGreetingDismissed';

const CONTEXTUAL_MESSAGES = [
  'Need help?',
  'I’m here to help.',
  'Ask me about your health information.',
  'Need help finding something?',
  'Let’s explore GlobalHealth.',
];

/**
 * Persistent floating AI Assistant launcher — the doctor-boy avatar at the
 * bottom-right corner of the viewport, visible across the whole website.
 *
 * - First visit: auto-shows "Hi, I am your personal AI".
 * - Returning visits: occasionally shows a short contextual message.
 * - Clicking the avatar opens the dedicated AI Assistant workspace.
 * - Only `assistantGreetingDismissed` is stored locally (a UI preference —
 *   never interpreted as health data).
 *
 * Exactly ONE instance is mounted, at the App level. The widget sits at
 * z-40: above page content but below the auth gate (z-90), language modal
 * (z-50), workspaces (z-70) and emergency/system overlays.
 */
export const GlobalHealthAIAssistant: React.FC<GlobalHealthAIAssistantProps> = ({ onOpen }) => {
  const [dismissed, setDismissed] = useState(false);
  const [bubble, setBubble] = useState<{ text: string; persistent: boolean } | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    let firstVisit = false;
    try {
      firstVisit = localStorage.getItem(GREETING_STORAGE_KEY) !== '1';
      if (firstVisit) localStorage.setItem(GREETING_STORAGE_KEY, '1');
    } catch {
      /* storage unavailable — treat as a returning visitor */
    }
    setIsFirstVisit(firstVisit);

    const timers: number[] = [];
    if (firstVisit) {
      // First visit: show the greeting, then let it rest.
      timers.push(window.setTimeout(() => setBubble({ text: 'Hi, I am your personal AI', persistent: true }), 1200));
      timers.push(window.setTimeout(() => setBubble(null), 9000));
    } else {
      // Returning visitor: occasionally surface a short contextual message.
      const show = Math.random() < 0.4;
      if (show) {
        const text = CONTEXTUAL_MESSAGES[Math.floor(Math.random() * CONTEXTUAL_MESSAGES.length)];
        timers.push(window.setTimeout(() => setBubble({ text, persistent: false }), 4000));
        timers.push(window.setTimeout(() => setBubble(null), 8000));
      }
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const markDismissed = () => {
    setDismissed(true);
    try {
      localStorage.setItem(GREETING_STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  const handleOpen = () => {
    setBubble(null);
    markDismissed();
    onOpen();
  };

  return (
    <div
      className="gh-float-anchor fixed z-40"
    >
      {bubble && <AIGreetingBubble text={bubble.text} onDismiss={markDismissed} />}

      <button
        type="button"
        onClick={handleOpen}
        aria-label="Open GlobalHealth AI Assistant"
        aria-haspopup="dialog"
        className="gh-float group relative block h-14 w-14 rounded-full border-2 border-white/90 shadow-lift ring-1 ring-slate-900/10 transition duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-500 focus-visible:ring-offset-2 active:scale-95 sm:h-16 sm:w-16"
      >
        <AIAvatar size={64} showStatus />
      </button>
    </div>
  );
};
