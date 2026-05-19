import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";

const FREE_CHAT_LIMIT = 3; 

export async function POST(req: NextRequest) {
  // 1. Auth & Paywall
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const service = createServiceClient();
  const { count } = await service.from("diagnoses").select("*", { count: "exact", head: true }).eq("user_id", user.id);
  const { data: sub } = await service.from("subscriptions").select("status, valid_until").eq("user_id", user.id).single();
  const isSubscribed = sub?.status === "active" && sub?.valid_until && new Date(sub.valid_until) > new Date();

  const { messages, isNewChat, chatId } = await req.json();

  if (isNewChat && (count ?? 0) >= FREE_CHAT_LIMIT && !isSubscribed) {
    return NextResponse.json({ error: "LIMIT_REACHED" }, { status: 402 });
  }

  // 2. Formatting messages for Groq
  const systemPrompt = {
    role: "system",
    content: "You are MechanicAI, an expert Indian vehicle mechanic assistant. You act like a human mechanic chatting with a customer. Your goal is to help them diagnose an emergency or issue, ask for their city to give local repair costs in Rupees, and warn them about common upsells. Be highly knowledgeable, empathetic, and concise. Do NOT use markdown headers or bold text heavily. Write like a text message."
  };

  const groqMessages = [systemPrompt, ...messages];

  // Check if any message contains an image (for Groq Vision)
  let hasImage = false;
  for (const m of messages) {
    if (Array.isArray(m.content)) {
      for (const c of m.content) {
        if (c.type === "image_url") hasImage = true;
      }
    }
  }
  
  const modelToUse = hasImage ? "llama-3.2-90b-vision-preview" : "llama-3.3-70b-versatile";

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: groqMessages,
        temperature: 0.5,
        max_tokens: 800,
        stream: true, // We are using Streaming for a real chat experience
      }),
    });

    if (!res.ok) {
        const err = await res.text();
        console.error("Groq error:", err);
        return NextResponse.json({ error: "AI Error" }, { status: 500 });
    }

    // 3. Return Streaming Response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = res.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }
        
        let aiFullResponse = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
              if (line === 'data: [DONE]') {
                break;
              }
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.choices[0].delta?.content) {
                    const textChunk = data.choices[0].delta.content;
                    aiFullResponse += textChunk;
                    controller.enqueue(new TextEncoder().encode(textChunk));
                  }
                } catch (e) {
                  // ignore JSON parse errors on incomplete chunks
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
          controller.close();

          // After streaming completes, save it to Supabase so it shows up in their History!
          try {
            if (isNewChat) {
                // Get a preview text from the user's first message
                let preview = "New Chat";
                const lastMsg = messages[messages.length - 1].content;
                if (typeof lastMsg === 'string') preview = lastMsg.slice(0, 50) + "...";
                if (Array.isArray(lastMsg)) preview = "Sent an image/audio...";

                await service.from("diagnoses").insert({
                  user_id: user.id,
                  symptom: preview,
                  result: [...messages, { role: "assistant", content: aiFullResponse }]
                });
            } else if (chatId) {
                // Fetch the existing chat and append the new messages
                const { data: existing } = await service.from("diagnoses").select("result").eq("id", chatId).single();
                if (existing && Array.isArray(existing.result)) {
                  await service.from("diagnoses").update({
                    result: [...existing.result, messages[messages.length - 1], { role: "assistant", content: aiFullResponse }]
                  }).eq("id", chatId);
                }
            }
          } catch(dbErr) {
              console.error("Failed to save chat to DB:", dbErr);
          }
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (e) {
    console.error("Chat streaming error:", e);
    return NextResponse.json({ error: "Failed to connect to AI" }, { status: 500 });
  }
}
