import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, Square, History, Plus, ChevronLeft, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
}

interface MemoryProject {
  project: string;
  last_updated: string;
  current_status: string;
  filename: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jarvis-chat`;
const MEMORY_BASE = "https://pipeline.voxovdesign.com/jarvis/memory";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function JarvisChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeProject, setActiveProject] = useState("bayatico-strategy");
  const [memoryProjects, setMemoryProjects] = useState<MemoryProject[]>([]);
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

  // Load conversation list and memory projects
  useEffect(() => {
    loadConversations();
    loadMemoryProjects();
  }, []);

  // Show welcome message when no conversation
  useEffect(() => {
    if (!conversationId && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `${getGreeting()}, Fredrik. What are we building today?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [conversationId]);

  async function loadMemoryProjects() {
    try {
      const resp = await fetch(MEMORY_BASE);
      if (resp.ok) {
        const data = await resp.json();
        setMemoryProjects(data.projects || []);
      }
    } catch {
      // Memory server might not be set up yet
    }
  }

  async function loadConversations() {
    const { data } = await supabase
      .from("conversations")
      .select("id, title, created_at")
      .order("updated_at", { ascending: false })
      .limit(50);
    if (data) setConversations(data);
  }

  async function loadConversation(id: string) {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(
        data.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(m.created_at),
        }))
      );
      setConversationId(id);
      setShowHistory(false);
    }
  }

  async function startNewConversation() {
    setConversationId(null);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `${getGreeting()}, Fredrik. What are we building today?`,
        timestamp: new Date(),
      },
    ]);
    setShowHistory(false);
  }

  async function saveMessage(convId: string, role: string, content: string) {
    await supabase.from("messages").insert({
      conversation_id: convId,
      role,
      content,
    });
  }

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const realMessages = messages.filter((m) => m.id !== "welcome");
    setMessages((prev) => [...prev.filter((m) => m.id !== "welcome"), userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      let convId = conversationId;
      if (!convId) {
        const title = text.slice(0, 80);
        const { data } = await supabase
          .from("conversations")
          .insert({ title })
          .select("id")
          .single();
        if (!data) throw new Error("Failed to create conversation");
        convId = data.id;
        setConversationId(convId);
        loadConversations();
      }

      await saveMessage(convId, "user", text);

      const apiMessages = [
        ...realMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: text },
      ];

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages, activeProject }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantSoFar = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const currentContent = assistantSoFar;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && last.id === "streaming") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: currentContent } : m
                  );
                }
                return [
                  ...prev,
                  { id: "streaming", role: "assistant" as const, content: currentContent, timestamp: new Date() },
                ];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (assistantSoFar) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === "streaming" ? { ...m, id: Date.now().toString() } : m
          )
        );
        await saveMessage(convId, "assistant", assistantSoFar);
        await supabase
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", convId);

        // Refresh memory projects if a new project was created
        const lower = text.toLowerCase();
        if (lower.startsWith("start project") || lower.startsWith("new project")) {
          loadMemoryProjects();
        }
      }
    } catch (err: any) {
      console.error("Jarvis error:", err);
      toast.error(err.message || "Failed to get response from Jarvis");
    } finally {
      setIsLoading(false);
    }
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
      toast.error("Speech recognition not supported in this browser.");
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

  // Format project slug to display name
  const formatProjectName = (slug: string) =>
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // History sidebar for mobile
  if (showHistory) {
    return (
      <div className="flex flex-col h-full bg-background">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <button onClick={() => setShowHistory(false)} className="text-muted-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-heading font-semibold text-sm">Conversation History</h2>
        </header>
        <div className="flex-1 overflow-y-auto">
          <button
            onClick={startNewConversation}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-primary font-medium border-b border-border hover:bg-muted/50"
          >
            <Plus className="w-4 h-4" /> New Conversation
          </button>
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => loadConversation(c.id)}
              className={`w-full text-left px-4 py-3 text-sm border-b border-border hover:bg-muted/50 transition-colors ${
                c.id === conversationId ? "bg-muted" : ""
              }`}
            >
              <p className="font-medium text-foreground truncate">{c.title || "Untitled"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(c.created_at).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-base font-semibold md:hidden">
            Bayati<span className="text-primary">OS</span>
          </h1>
          <span className="text-xs text-muted-foreground hidden md:inline">
            Jarvis — {conversationId ? "Conversation" : "New Chat"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={startNewConversation}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="New conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              loadConversations();
              setShowHistory(true);
            }}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="History"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
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
              <div
                className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-chat-jarvis flex items-center justify-center shrink-0 mt-1">
                    <span className="text-xs font-semibold text-sidebar-accent">J</span>
                  </div>
                )}
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

        {isLoading && messages[messages.length - 1]?.id !== "streaming" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
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

      {/* Input bar with project switcher */}
      <div className="border-t border-border px-4 py-3 md:px-8 md:py-4 bg-background">
        <div className="max-w-3xl mx-auto space-y-2">
          {/* Project switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground shrink-0">Project:</span>
            <Select value={activeProject} onValueChange={setActiveProject}>
              <SelectTrigger className="h-7 text-xs border-border bg-card w-auto min-w-[140px] max-w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bayatico-strategy">BayatiCo Strategy</SelectItem>
                {memoryProjects
                  .filter((p) => p.project !== "bayatico-strategy" && p.project !== "fredrik-profile")
                  .map((p) => (
                    <SelectItem key={p.project} value={p.project}>
                      {formatProjectName(p.project)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Input field */}
          <div className="flex items-end gap-2">
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
    </div>
  );
}
