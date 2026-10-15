import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { AlertCircle, Bot, MessageSquarePlus, Send, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from '@/components/ai-elements/prompt-input';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { CHAT_THREADS_STORAGE_KEY, createChatThread, ensureChatThread, useStoredChatThreads } from '@/lib/chatStorage';

const suggestions = [
  'How can I invest ₹10,000?',
  'Best savings plan for Indian students?',
  'Explain SIP investments',
  'Current market outlook?',
];

interface AIChatProps {
  threadId: string;
}

const getReadableError = (error: Error | undefined) => {
  if (!error) return null;
  const message = error.message.replace(/^Error:\s*/i, '').trim();
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return 'Could not connect to the advisor. Check your connection and try again.';
  }
  return message || 'The advisor could not answer that message. Please try again.';
};

const AIChat = ({ threadId }: AIChatProps) => {
  const navigate = useNavigate();
  const { threads, setThreads, persistMessages } = useStoredChatThreads(threadId);
  const initialMessages = useMemo(() => ensureChatThread(threadId).messages, [threadId]);
  const [input, setInput] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wasBusy = useRef(false);
  const activeThread = threads.find((thread) => thread.id === threadId);
  const chatApi = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
  const chat = useChat({
    id: threadId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: chatApi,
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: { threadId },
    }),
    onError: (error) => setSendError(getReadableError(error)),
  });
  const { messages, sendMessage, status, error, regenerate, stop, clearError } = chat;
  const isBusy = status === 'submitted' || status === 'streaming';
  const visibleError = sendError ?? getReadableError(error);

  useEffect(() => {
    persistMessages(messages);
  }, [messages, status, persistMessages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]);

  useEffect(() => {
    if (wasBusy.current && !isBusy) inputRef.current?.focus();
    wasBusy.current = isBusy;
  }, [isBusy]);

  const startNewConversation = useCallback(() => {
    const nextThread = createChatThread();
    setThreads((current) => {
      const next = [nextThread, ...current];
      try {
        window.localStorage.setItem(CHAT_THREADS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        toast.error('This browser could not save the new conversation.');
      }
      return next;
    });
    setSendError(null);
    navigate(`/chat/${nextThread.id}`);
  }, [navigate, setThreads]);

  const submitMessage = useCallback(async (text: string) => {
    const cleaned = text.trim();
    if (!cleaned || isBusy) return;

    setInput('');
    setSendError(null);
    clearError();
    inputRef.current?.focus();
    try {
      await sendMessage({ text: cleaned });
    } catch (sendFailure) {
      setInput(cleaned);
      setSendError(getReadableError(sendFailure instanceof Error ? sendFailure : undefined));
    }
  }, [clearError, isBusy, sendMessage]);

  const selectSuggestion = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const retry = async () => {
    setSendError(null);
    clearError();
    const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user');
    const lastUserText = lastUserMessage?.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('');
    if (!lastUserMessage || !lastUserText) return;
    try {
      await sendMessage({ text: lastUserText, messageId: lastUserMessage.id });
    } catch (retryFailure) {
      setSendError(getReadableError(retryFailure instanceof Error ? retryFailure : undefined));
    }
  };

  return (
    <section id="ai-chat" className="scroll-mt-24 bg-gradient-to-b from-background to-secondary/20 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">
            <span className="bg-gradient-to-r from-electric-blue to-neon-teal bg-clip-text text-transparent">AI Financial Advisor</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            Get clear, practical guidance for your financial questions.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="min-w-0 border-b border-border pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4" aria-label="Saved conversations">
            <Button className="mb-4 w-full justify-start" variant="outline" onClick={startNewConversation}>
              <MessageSquarePlus className="h-4 w-4" />
              New conversation
            </Button>
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-normal text-muted-foreground">Your conversations</h3>
            <nav className="flex max-h-72 flex-col gap-1 overflow-y-auto lg:max-h-[470px]" aria-label="Conversation list">
              {threads.map((thread) => (
                <Button
                  key={thread.id}
                  variant={thread.id === threadId ? 'secondary' : 'ghost'}
                  className="h-auto min-h-10 justify-start whitespace-normal px-3 py-2 text-left text-sm"
                  aria-current={thread.id === threadId ? 'page' : undefined}
                  onClick={() => navigate(`/chat/${thread.id}`)}
                >
                  <span className="line-clamp-2 break-words">{thread.title}</span>
                </Button>
              ))}
            </nav>
          </aside>

          <Card className="flex min-h-[560px] min-w-0 flex-col border border-electric-blue/20 bg-card/70 shadow-[var(--shadow-elevated)]">
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-electric-blue" aria-hidden="true">
                <Bot className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-foreground">{activeThread?.title ?? 'AI Financial Advisor'}</h3>
                <p className="text-xs text-muted-foreground">Finivera · Gemini</p>
              </div>
              <ShieldCheck className="h-5 w-5 shrink-0 text-neon-teal" aria-label="Secure advisor connection" />
            </div>

            <Conversation className="min-h-0 flex-1" aria-label="Advisor conversation">
              <ConversationContent className="min-h-full gap-5 px-4 py-5 sm:px-6">
                {messages.length === 0 ? (
                  <ConversationEmptyState
                    className="min-h-64"
                    icon={<Bot className="h-10 w-10 text-electric-blue" />}
                    title="What would you like to work on?"
                    description="Ask about saving, investing, debt, budgeting, or financial goals."
                  />
                ) : messages.map((message: UIMessage) => (
                  <Message from={message.role} key={message.id}>
                    <MessageContent>
                      {message.parts.map((part, index) => part.type === 'text' ? (
                        <MessageResponse key={`${message.id}-${index}`} isAnimating={status === 'streaming' && index === message.parts.length - 1}>
                          {part.text}
                        </MessageResponse>
                      ) : null)}
                    </MessageContent>
                  </Message>
                ))}
                {status === 'submitted' && <div className="px-2"><Shimmer className="text-sm">Thinking through your question…</Shimmer></div>}
                {visibleError && (
                  <div className="flex flex-wrap items-center gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-foreground" role="alert">
                    <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                    <span className="min-w-0 flex-1">{visibleError}</span>
                    {messages.some((message) => message.role === 'user') && (
                      <Button variant="outline" size="sm" onClick={retry} disabled={isBusy}>Try again</Button>
                    )}
                  </div>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            {messages.length === 0 && (
              <div className="grid grid-cols-1 gap-2 px-4 pb-4 sm:grid-cols-2 sm:px-6">
                {suggestions.map((suggestion) => (
                  <Button key={suggestion} variant="glow" className="h-auto min-h-11 justify-start whitespace-normal py-2.5 text-left" onClick={() => selectSuggestion(suggestion)}>
                    <span className="text-sm">{suggestion}</span>
                  </Button>
                ))}
              </div>
            )}

            <div className="border-t border-border p-4 sm:p-5">
              <PromptInput
                className="w-full border-electric-blue/30 bg-background"
                onSubmit={(message) => void submitMessage(message.text)}
                onError={({ message }) => toast.error(message)}
              >
                <PromptInputTextarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.currentTarget.value)}
                  placeholder="Ask about saving, investing, or planning…"
                  aria-label="Message the AI financial advisor"
                  className="min-h-20 px-4 text-foreground placeholder:text-muted-foreground"
                />
                <PromptInputFooter className="justify-between border-t border-border px-3 py-2">
                  <span className="text-xs text-muted-foreground">Enter to send · Shift+Enter for a new line</span>
                  <PromptInputSubmit status={visibleError ? 'ready' : status} onStop={stop} disabled={!input.trim() && !isBusy} aria-label={isBusy ? 'Stop response' : 'Send message'}>
                    {!isBusy && <Send className="h-4 w-4" />}
                  </PromptInputSubmit>
                </PromptInputFooter>
              </PromptInput>
              <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
                AI-generated financial information is educational only and is not a guarantee of investment returns.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AIChat;