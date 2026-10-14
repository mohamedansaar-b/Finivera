import type { UIMessage } from 'ai';
import { useCallback, useEffect, useState } from 'react';

const THREADS_STORAGE_KEY = 'finivera.chat.threads.v1';

export interface ChatThread {
  id: string;
  title: string;
  updatedAt: string;
  messages: UIMessage[];
}

const isChatThread = (value: unknown): value is ChatThread => {
  if (!value || typeof value !== 'object') return false;
  const thread = value as Partial<ChatThread>;
  return typeof thread.id === 'string'
    && typeof thread.title === 'string'
    && typeof thread.updatedAt === 'string'
    && Array.isArray(thread.messages)
    && thread.messages.every((message) => (
      Boolean(message)
      && typeof message === 'object'
      && typeof (message as UIMessage).id === 'string'
      && ['user', 'assistant'].includes((message as UIMessage).role)
      && Array.isArray((message as UIMessage).parts)
    ));
};

const readChatThreads = (): ChatThread[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(THREADS_STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isChatThread) : [];
  } catch {
    return [];
  }
};

export const saveChatThreads = (threads: ChatThread[]) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
  } catch {
    // Keep the chat usable when browser storage is full or unavailable.
  }
};

export const getStoredChatThreads = (): ChatThread[] => readChatThreads();
export const CHAT_THREADS_STORAGE_KEY = THREADS_STORAGE_KEY;

export const createChatThread = (): ChatThread => ({
  id: crypto.randomUUID(),
  title: 'New conversation',
  updatedAt: new Date().toISOString(),
  messages: [],
});

/** Loads browser history and creates its first thread in the same idempotent path. */
export const initializeChatThreads = (): ChatThread[] => {
  const existingThreads = readChatThreads();
  if (existingThreads.length > 0) return existingThreads;

  const firstThread = createChatThread();
  saveChatThreads([firstThread]);
  return [firstThread];
};

export const ensureChatThread = (id: string): ChatThread => {
  const threads = readChatThreads();
  const existing = threads.find((thread) => thread.id === id);
  if (existing) return existing;

  const created = { ...createChatThread(), id };
  saveChatThreads([created, ...threads]);
  return created;
};

export const useStoredChatThreads = (activeThreadId: string) => {
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    const existingThreads = readChatThreads();
    if (existingThreads.length === 0) {
      const initialThread: ChatThread = {
        id: activeThreadId,
        title: 'New conversation',
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      saveChatThreads([initialThread]);
      return [initialThread];
    }
    ensureChatThread(activeThreadId);
    return readChatThreads();
  });

  useEffect(() => {
    const activeThread = ensureChatThread(activeThreadId);
    setThreads((current) => current.some((thread) => thread.id === activeThreadId)
      ? current
      : [activeThread, ...current]);
  }, [activeThreadId]);

  const persistMessages = useCallback((messages: UIMessage[]) => {
    setThreads((currentThreads) => {
      const existing = currentThreads.find((thread) => thread.id === activeThreadId);
      const firstUserMessage = messages.find((message) => message.role === 'user')
        ?.parts.find((part) => part.type === 'text');
      const proposedTitle = firstUserMessage?.type === 'text'
        ? firstUserMessage.text.trim().slice(0, 48)
        : '';
      const updatedThread: ChatThread = {
        ...(existing ?? { id: activeThreadId, title: 'New conversation', updatedAt: new Date().toISOString(), messages: [] }),
        title: existing?.title === 'New conversation' && proposedTitle ? proposedTitle : existing?.title ?? 'New conversation',
        updatedAt: new Date().toISOString(),
        messages,
      };
      const nextThreads = [updatedThread, ...currentThreads.filter((thread) => thread.id !== activeThreadId)]
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
      saveChatThreads(nextThreads);
      return nextThreads;
    });
  }, [activeThreadId]);

  return { threads, setThreads, persistMessages };
};