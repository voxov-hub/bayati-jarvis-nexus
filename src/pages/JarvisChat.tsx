import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, MicOff, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function JarvisChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `${getGreeting()}, Fredrik. What are we building today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Simulate Jarvis response (replace with actual API call)
    setTimeout(() => {
      const jarvisMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I hear you. Once we connect to the AI backend, I'll be fully operational. For now, the interface is ready — let's wire me up next.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, jarvisMsg]);
      setIsLoading(false);
    }, 1200);
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
      setIsRecording(false);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header — mobile only */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border">
        <h1 className="font-heading text-base font-semibold">
          Bayati<span className="text-primary">OS</span>
        </h1>
        <span className="text-xs text-muted-foreground">Jarvis</span>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-chat-jarvis flex items-center justify-center shrink-0 mt-1">
                    <span className="text-xs font-semibold text-sidebar-accent">J</span>
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-chat-user text-chat-user-fg rounded-br-md"
                      : "bg-card text-foreground border border-border rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:font-heading">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-7 h-7 rounded-full bg-chat-jarvis flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-sidebar-accent">J</span>
            </div>
            <div className="flex gap-1.5 px-4 py-3">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse-dot" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse-dot [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse-dot [animation-delay:0.4s]" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input bar */}
      <div className="border-t border-border px-4 py-3 md:px-8 md:py-4 bg-background">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <div className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Talk to Jarvis..."
              rows={1}
              className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground max-h-32"
              style={{ minHeight: "24px" }}
            />
            <button
              onClick={toggleRecording}
              className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                isRecording
                  ? "bg-destructive text-destructive-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
