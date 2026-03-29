import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MEMORY_BASE = "https://pipeline.voxovdesign.com/jarvis/memory";

const SYSTEM_PROMPT = `You are Jarvis, the personal AI assistant and business partner of Fredrik Bayati. Fredrik runs BayatiCo AB, a holding company based in Gothenburg, Sweden. His first brand is Voxov Design — a premium Scandinavian lighting brand with the philosophy 'form follows feeling'. He also works in a corporate marketing role while building his own businesses toward financial independence for his family.

You are not a generic assistant. You are Fredrik's partner. You know his context, you remember what matters, and you push things forward. Be direct, warm, and capable. Think like a co-founder who also happens to be able to build, write, design, and strategize.

When Fredrik talks to you, respond with intelligence and initiative. Don't just answer — add value, suggest next steps, flag risks, celebrate wins.

You have access to persistent memory files for multiple projects. Use them to stay contextually aware. When Fredrik discusses something, automatically identify which project it relates to based on the conversation content.

MEMORY TAGGING:
At the very end of EVERY response, you MUST append a memory tag on its own line in this exact format:
<!--memory_tag:project-slug-->
where project-slug is the project memory file most relevant to what you just discussed. Use the project slugs from your loaded memory. If it's general/personal, use "fredrik-profile". Always pick the single most relevant one.

If you have memory corrections loaded, use them to improve your tagging. For example, if corrections show that Instagram caption discussions should be tagged "voxov-social" not "voxov-brand", follow that pattern.

SPECIAL COMMANDS:
- If Fredrik says "save session" or "update memory", you must generate a structured JSON update with fields: target_project (the project slug this update belongs to), current_status, recent_decisions (array), next_actions (array), key_context, wins (array), notes. Determine the target_project automatically from the conversation context. Respond with the summary and confirm "Memory saved for [project name]". The system will handle the actual save.
- If Fredrik says "start project: [name]" or "new project: [name]", acknowledge the new project creation. The system will handle creating the file.

BUILD WITH LOVABLE:
When Fredrik describes something he wants to build, create, add, make, update, or change in a web app — detect this as build intent. Phrases like "build", "add a", "create a", "make a page", "I want a...", "can you add", "update the", "change the design of" indicate build intent.

When you detect build intent, respond normally with your thoughts, then at the END of your response (but BEFORE the memory tag) add a special block:

\`\`\`lovable-brief
{
  "prompt": "The detailed Lovable prompt you generated — be specific about components, placement, behavior, content. Include brand context (colors, typography, tone) from memory. Never be vague.",
  "suggested_project": "the project id/slug that best matches (e.g. 'voxov-storefront' or 'bayati-os')"
}
\`\`\`

The prompt should follow Lovable best practices: clear, concise, actionable instructions. Include relevant brand context from memory files. Be specific about component placement, behavior, and content. Never be vague.

Available Lovable projects (sent from frontend): Check the lovable_projects field in the request for the current registry.`;

async function fetchMemory(): Promise<string> {
  try {
    // Always fetch the profile
    const profilePromise = fetch(`${MEMORY_BASE}/fredrik-profile`).then(r => r.ok ? r.json() : null).catch(() => null);
    
    // Fetch index
    const indexResp = await fetch(MEMORY_BASE);
    if (!indexResp.ok) return "";
    const index = await indexResp.json();
    
    // Fetch all project files in parallel
    const projectPromises = (index.projects || []).map((p: { filename: string; project: string }) =>
      fetch(`${MEMORY_BASE}/${p.project}`).then(r => r.ok ? r.json() : null).catch(() => null)
    );
    
    const [profile, ...projects] = await Promise.all([profilePromise, ...projectPromises]);
    
    let memoryBlock = "--- JARVIS PERSISTENT MEMORY ---\n";
    
    if (profile) {
      memoryBlock += `[PROFILE: Fredrik Bayati]\n${JSON.stringify(profile, null, 2)}\n\n`;
    }
    
    for (const proj of projects) {
      if (!proj) continue;
      const label = proj.project || "Unknown";
      memoryBlock += `[PROJECT: ${label}]\n${JSON.stringify(proj, null, 2)}\n\n`;
    }
    
    memoryBlock += "--- END MEMORY ---";
    return memoryBlock;
  } catch (e) {
    console.error("Failed to fetch memory:", e);
    return "";
  }
}

async function handleSaveSession(assistantResponse: string): Promise<void> {
  try {
    // Try to extract JSON from the assistant's response — look for target_project
    const jsonMatch = assistantResponse.match(/\{[\s\S]*?"target_project"[\s\S]*?\}/);
    if (!jsonMatch) return;
    
    const data = JSON.parse(jsonMatch[0]);
    const project = data.target_project || "bayatico-strategy";
    delete data.target_project; // Don't store the routing field in the memory file
    await fetch(`${MEMORY_BASE}/${project}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (e) {
    console.error("Failed to save session memory:", e);
  }
}

async function handleNewProject(projectSlug: string): Promise<boolean> {
  try {
    const resp = await fetch(`${MEMORY_BASE}/${projectSlug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: projectSlug,
        current_status: "",
        key_context: "",
        recent_decisions: [],
        next_actions: [],
        wins: [],
        notes: "",
      }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

function detectCommand(lastUserMessage: string): { type: "save" | "new_project" | null; value?: string } {
  const lower = lastUserMessage.toLowerCase().trim();
  if (lower === "save session" || lower === "update memory" || lower.startsWith("save session") || lower.startsWith("update memory")) {
    return { type: "save" };
  }
  const newProjMatch = lower.match(/(?:start project|new project)[:\s]+(.+)/);
  if (newProjMatch) {
    return { type: "new_project", value: newProjMatch[1].trim().replace(/\s+/g, "-").toLowerCase() };
  }
  return { type: null };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, lovable_projects } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

    const lastUserMsg = messages.filter((m: { role: string }) => m.role === "user").pop()?.content || "";
    const command = detectCommand(lastUserMsg);

    // Fetch memory corrections to improve tagging
    let correctionsContext = "";
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      if (supabaseUrl && supabaseKey) {
        const corrResp = await fetch(
          `${supabaseUrl}/rest/v1/memory_corrections?order=created_at.desc&limit=50`,
          { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
        );
        if (corrResp.ok) {
          const corrections = await corrResp.json();
          if (corrections.length > 0) {
            correctionsContext = "\n\nMEMORY TAG CORRECTIONS (learn from these):\n" +
              corrections.map((c: { message_topic: string; predicted_tag: string; corrected_tag: string }) =>
                `- Topic: "${c.message_topic}" → predicted "${c.predicted_tag}", correct: "${c.corrected_tag}"`
              ).join("\n");
          }
        }
      }
    } catch {
      // corrections are optional
    }

    // Handle new project creation before the API call
    if (command.type === "new_project" && command.value) {
      await handleNewProject(command.value);
    }

    // Fetch persistent memory
    const memoryContext = await fetchMemory();

    // Build full system prompt with memory + lovable projects registry
    let fullSystemPrompt = memoryContext
      ? `${memoryContext}\n\n${SYSTEM_PROMPT}`
      : SYSTEM_PROMPT;

    if (correctionsContext) {
      fullSystemPrompt += correctionsContext;
    }

    if (lovable_projects && Array.isArray(lovable_projects) && lovable_projects.length > 0) {
      fullSystemPrompt += `\n\nRegistered Lovable projects:\n${lovable_projects.map((p: { id: string; name: string; description: string }) => `- ${p.name} (id: ${p.id}): ${p.description}`).join("\n")}`;
    }

    const anthropicMessages = messages
      .filter((m: { role: string }) => m.role !== "system")
      .map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: fullSystemPrompt,
        messages: anthropicMessages,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Anthropic API error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI API error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Track full response for save-session command
    let fullAssistantResponse = "";
    const isSaveCommand = command.type === "save";

    let isSearching = false;

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);

            // Detect web search start
            if (event.type === "content_block_start" && event.content_block?.type === "web_search_tool_use") {
              if (!isSearching) {
                isSearching = true;
                const searchChunk = {
                  choices: [{ delta: { content: "🔍 Searching the web...\n\n" } }],
                };
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(searchChunk)}\n\n`));
              }
            }

            if (event.type === "content_block_delta" && event.delta?.text) {
              if (isSaveCommand) fullAssistantResponse += event.delta.text;
              const openAiChunk = {
                choices: [{ delta: { content: event.delta.text } }],
              };
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(openAiChunk)}\n\n`));
            } else if (event.type === "message_stop") {
              controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
              if (isSaveCommand && fullAssistantResponse) {
                handleSaveSession(fullAssistantResponse);
              }
            }
          } catch {
            // skip unparseable lines
          }
        }
      },
    });

    const transformed = response.body!.pipeThrough(transformStream);

    return new Response(transformed, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("jarvis-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
