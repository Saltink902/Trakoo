"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface InsightResponse {
  answer: string;
  suspects: string[];
  evidence: string[];
  confidence: number;
  dataUsed: string[];
}

interface Message {
  id: string;
  question: string;
  response: InsightResponse | null;
  isLoading: boolean;
  error?: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  { id: "anxious", text: "Why am I feeling anxious?", icon: "🧠" },
  { id: "digestive", text: "Why is my digestion off?", icon: "💩" },
  { id: "food", text: "What did I eat recently?", icon: "🍽️" },
  { id: "summary", text: "Give me a weekly summary", icon: "📊" },
];

const CONFIDENCE_LABELS = ["Very low", "Low", "Medium", "High", "Very high"];
const CONFIDENCE_COLORS = [
  "bg-red-100 text-red-700",
  "bg-orange-100 text-orange-700",
  "bg-yellow-100 text-yellow-700",
  "bg-green-100 text-green-700",
  "bg-emerald-100 text-emerald-700",
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

export function InsightsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const askQuestion = async (question: string) => {
    if (!question.trim() || isSubmitting) return;

    const messageId = Date.now().toString();

    // Add message with loading state
    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        question: question.trim(),
        response: null,
        isLoading: true,
        timestamp: new Date(),
      },
    ]);

    setInputValue("");
    setIsSubmitting(true);

    try {
      // Get auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Not authenticated");
      }

      const res = await fetch("/api/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get insights");
      }

      const data: InsightResponse = await res.json();

      // Update message with response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, response: data, isLoading: false } : msg
        )
      );
    } catch (error) {
      console.error("Error asking question:", error);

      // Update message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                isLoading: false,
                error: error instanceof Error ? error.message : "Something went wrong",
              }
            : msg
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    askQuestion(inputValue);
  };

  const handleChipClick = (question: string) => {
    askQuestion(question);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col flex-1 min-h-full min-w-full w-full max-w-[430px] mx-auto px-6 pt-4 pb-6 shrink-0">
      <header className="grid grid-cols-3 items-center gap-2 mb-6">
        <button
          type="button"
          className="w-12 h-12 rounded-full soft-pill flex items-center justify-center text-trakoo-text focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 place-self-start"
          aria-label="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="soft-pill inline-flex items-center justify-center gap-1.5 px-3 py-1.5 place-self-center whitespace-nowrap">
          <span className="text-xs font-medium text-trakoo-text">{getGreeting()}</span>
          <span aria-hidden className="text-xs">☀️</span>
        </div>
        <div className="place-self-end" />
      </header>

      <section className="w-full text-center mb-6">
        <h1 className="text-[32px] leading-[1.2] font-bold text-[#1a1a1a] tracking-tight max-w-md mx-auto mb-2">
          Health Insights
        </h1>
        <p className="text-[15px] leading-relaxed text-[#8b8b8b] max-w-sm mx-auto">
          Ask me anything about your health data.
        </p>
      </section>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-0 pb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <img src="/robot.png" alt="" className="h-[120px] w-[120px] object-contain mb-2" aria-hidden />
            <p className="text-trakoo-muted text-sm max-w-xs">
              I can help you understand patterns in your mood, digestion, diet, symptoms, and
              menstrual cycle. Ask me anything!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                {/* User Question */}
                <div className="flex justify-end">
                  <div className="soft-pill px-4 py-2 max-w-[85%] text-right">
                    <p className="text-sm text-trakoo-text">{msg.question}</p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  {msg.isLoading ? (
                    <div className="soft-card px-4 py-3 max-w-[90%]">
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse flex gap-1">
                          <span className="w-2 h-2 bg-trakoo-muted/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-trakoo-muted/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-trakoo-muted/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-sm text-trakoo-muted">Analyzing your data...</span>
                      </div>
                    </div>
                  ) : msg.error ? (
                    <div className="soft-card px-4 py-3 max-w-[90%] border border-red-200">
                      <p className="text-sm text-red-600">{msg.error}</p>
                    </div>
                  ) : msg.response ? (
                    <div className="soft-card px-4 py-3 max-w-[90%] space-y-3">
                      {/* Main Answer */}
                      <p className="text-sm text-trakoo-text leading-relaxed">{msg.response.answer}</p>

                      {/* Suspects/Possible Causes */}
                      {msg.response.suspects && msg.response.suspects.length > 0 && (
                        <div>
                          <p className="text-xs text-trakoo-muted mb-1.5">Possible factors:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.response.suspects.map((suspect, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200"
                              >
                                {suspect}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Evidence */}
                      {msg.response.evidence && msg.response.evidence.length > 0 && (
                        <div>
                          <p className="text-xs text-trakoo-muted mb-1.5">Evidence:</p>
                          <ul className="text-xs text-trakoo-text space-y-1">
                            {msg.response.evidence.map((e, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-trakoo-muted">•</span>
                                <span>{e}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Confidence & Data Used */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            CONFIDENCE_COLORS[msg.response.confidence - 1] || CONFIDENCE_COLORS[0]
                          }`}
                        >
                          {CONFIDENCE_LABELS[msg.response.confidence - 1] || "Unknown"} confidence
                        </span>
                        <span className="text-xs text-trakoo-muted">
                          Used: {msg.response.dataUsed?.join(", ") || "general"}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <div className="pb-3">
          <p className="text-xs text-trakoo-muted mb-2 text-center">Quick questions:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q.id}
                onClick={() => handleChipClick(q.text)}
                disabled={isSubmitting}
                className="soft-pill px-3 py-1.5 text-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
              >
                <span>{q.icon}</span>
                <span>{q.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear Chat Button */}
      {messages.length > 0 && (
        <div className="pb-2 flex justify-center">
          <button
            onClick={clearChat}
            className="text-xs text-trakoo-muted hover:text-trakoo-text transition-colors"
          >
            Clear conversation
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="pb-6 pt-2">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isSubmitting}
            className="flex-1 soft-pill px-4 py-3 text-sm text-trakoo-text placeholder:text-trakoo-muted/70 focus:outline-none focus:ring-2 focus:ring-trakoo-text/20 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSubmitting || !inputValue.trim()}
            className="soft-pill px-4 py-3 text-sm font-medium text-trakoo-text hover:bg-white/80 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "..." : "Ask"}
          </button>
        </form>
      </div>
    </div>
  );
}
