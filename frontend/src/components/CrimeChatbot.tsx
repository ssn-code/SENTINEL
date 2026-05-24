import React, { useState } from 'react';
import { Bot, Send, X } from 'lucide-react';
import { API_BASE_URL, fetchApiJson } from '../lib/api';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatApiResponse = {
  answer: string;
};

const CHAT_TIMEOUT_MS = 30000;

export const CrimeChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Ask SENTINEL AI about the crime dataset. Example: Compare Maharashtra and Delhi on cyber crimes.',
    },
  ]);

  const extractCompareStates = (input: string) => {
    const match = input.match(/compare\s+(.+?)\s+and\s+(.+?)(?:[?.!]|$)/i);
    if (!match) return null;

    const normalizeForUrl = (value: string) =>
      value
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[?!.]+$/g, '');

    return {
      stateA: normalizeForUrl(match[1]),
      stateB: normalizeForUrl(match[2]),
    };
  };

  const sendQuestion = async () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isLoading) return;

    setMessages((current) => [...current, { role: 'user', content: trimmedQuestion }]);
    setQuestion('');
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);

    try {
      const payload = await fetchApiJson<ChatApiResponse>('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: trimmedQuestion }),
        signal: controller.signal,
      });

      setMessages((current) => [...current, { role: 'assistant', content: payload.answer }]);

      const compareStates = extractCompareStates(trimmedQuestion);
      if (compareStates) {
        const query = new URLSearchParams({
          stateA: compareStates.stateA,
          stateB: compareStates.stateB,
        });
        window.location.hash = `#/compare?${query.toString()}`;
        setIsOpen(false);
      }
    } catch (error) {
      const fallbackMessage =
        error instanceof DOMException && error.name === 'AbortError'
          ? 'SENTINEL AI timed out. Check that the backend can reach OpenAI and PostgreSQL.'
          : error instanceof Error
            ? error.message
            : `SENTINEL AI is unavailable right now. Check that the FastAPI backend is running on ${API_BASE_URL}.`;

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: fallbackMessage,
        },
      ]);
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-label={isOpen ? 'Close SENTINEL AI' : 'Open SENTINEL AI'}
        title="SENTINEL AI"
        className="fixed bottom-6 right-6 z-[120] inline-flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-400/10 text-cyan-200 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur transition-all hover:scale-105 hover:bg-cyan-400/15"
      >
        <Bot className="h-7 w-7" />
      </button>

      {isOpen ? (
        <div className="fixed bottom-[5.5rem] right-6 z-[120] flex h-[560px] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-surface shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex rounded-2xl bg-cyan-400/10 p-2 text-cyan-300">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <div className="font-semibold text-white">SENTINEL AI</div>
                <div className="text-xs text-gray-500">Powered by OpenAI, grounded in your dataset</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/8 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'ml-auto bg-cyan-400/15 text-cyan-50'
                    : 'bg-bg/70 text-gray-200'
                }`}
              >
                {message.content}
              </div>
            ))}

            {isLoading ? (
              <div className="max-w-[88%] rounded-2xl bg-bg/70 px-4 py-3 text-sm text-gray-400">
                Querying the crime dataset...
              </div>
            ) : null}
          </div>

          <div className="border-t border-white/8 p-4">
            <div className="flex items-end gap-3">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void sendQuestion();
                  }
                }}
                rows={2}
                placeholder="Ask about state crime statistics..."
                className="min-h-[56px] flex-1 resize-none rounded-2xl border border-white/8 bg-bg/65 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-300/35"
              />
              <button
                type="button"
                onClick={() => void sendQuestion()}
                disabled={isLoading || !question.trim()}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default CrimeChatbot;
