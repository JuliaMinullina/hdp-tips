"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, Send, Loader2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatSidebarProps {
  systemPrompt: string;
  onClose: () => void;
}

export function ChatSidebar({ systemPrompt, onClose }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    const apiMessages = [
      { role: "system" as const, content: systemPrompt },
      ...updatedMessages,
    ];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Ошибка ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;

          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return next;
              });
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Произошла ошибка";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Не удалось получить ответ: ${errorMsg}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <aside className="fixed right-0 top-0 w-[400px] h-screen border-l bg-white flex flex-col overflow-hidden z-40">
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Вопрос по задаче</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Задайте вопрос ИИ-ассистенту по этой задаче
            </p>
          </div>
        ) : (
          <ScrollArea ref={scrollRef} className="flex-1 px-4">
            <div className="flex flex-col gap-3 py-4">
              {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground ml-8"
                    : "bg-muted mr-8"
                )}
              >
                {msg.content}
                {msg.role === "assistant" &&
                  isLoading &&
                  idx === messages.length - 1 &&
                  msg.content === "" && (
                    <Loader2 className="h-4 w-4 animate-spin inline-block" />
                  )}
              </div>
            ))}
            </div>
          </ScrollArea>
        )}

        <Separator />
        <div className="p-3 shrink-0">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напишите вопрос..."
              className="min-h-[44px] max-h-[120px] resize-none text-sm"
              rows={1}
              disabled={isLoading}
            />
            <Button
              size="icon"
              className="h-[44px] w-[44px] shrink-0"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
    </aside>
  );
}
