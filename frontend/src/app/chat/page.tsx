"use client";
import { useAuth } from "@clerk/nextjs";
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import Link from "next/link";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Navbar from "@/components/Navbar";

type Source = {
  id: number;
  title: string;
  createdAt: string;
};

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

let messageIdCounter = 0;

export default function ChatPage() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const token = await getToken();
    if (!token) return;

    const userMessage: Message = { id: ++messageIdCounter, role: "user", content: question.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ question: userMessage.content }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: ++messageIdCounter,
        role: "assistant",
        content: data.answer,
        sources: data.sources,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: ++messageIdCounter,
          role: "assistant" as const,
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Navbar />
        <div className="flex flex-col h-[calc(100vh-5rem)]">
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="flex flex-col gap-4 h-full justify-center items-center">
                <div className="text-2xl">Ask anything about your notes</div>
                <div className="text-gray-400">
                  ZenNote AI will search through your notes and cite sources for
                  every answer
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-lg ${msg.role === "user" ? "bg-purple-600" : "bg-gray-700"}`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <div className="text-xs text-gray-400 mb-2">Sources:</div>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((source) => (
                          <Link
                            key={source.id}
                            href={`/realShowList?noteId=${source.id}`}
                            className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
                          >
                            {source.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 p-4 rounded-lg flex items-center gap-2">
                  <Loader2 className="animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t-2 border-gray-700 p-4">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about your notes..."
                className="flex-1 p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 p-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
                disabled={isLoading || !question.trim()}
              >
                <Send />
              </button>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
