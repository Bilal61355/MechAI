import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";

const FREE_LIMIT = 3;

export async function POST(req: NextRequest) {
  // ── 1. Auth check ──────────────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  // ── 2. Usage limit check ───────────────────────────────────────────────────
  const service = createServiceClient();

  // Count existing diagnoses for this user
  const { count } = await service
    .from("diagnoses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const diagnosisCount = count ?? 0;

  // Check subscription status
  const { data: sub } = await service
    .from("subscriptions")
    .select("status, valid_until")
    .eq("user_id", user.id)
    .single();

  const isSubscribed =
    sub?.status === "active" &&
    sub?.valid_until &&
    new Date(sub.valid_until) > new Date();

  if (diagnosisCount >= FREE_LIMIT && !isSubscribed) {
    return NextResponse.json({ error: "LIMIT_REACHED" }, { status: 402 });
  }

  // ── 3. Parse request ───────────────────────────────────────────────────────
  const { brand, model, year, symptom } = await req.json();

  const prompt = `You are MechanicAI, an expert Indian vehicle mechanic assistant. A user has a ${year} ${brand} ${model} and describes this symptom: "${symptom}"

Respond ONLY with a JSON object, no explanation, no markdown, no backticks. Just raw JSON:
{
  "problem": "short diagnosis name",
  "severity": "low or medium or high",
  "explanation": "2-3 sentences explaining the problem in simple English",
  "fairPrice": "₹X – ₹Y (Bengaluru)",
  "dealerPrice": "₹X – ₹Y",
  "whatToSay": "exact words to say to the mechanic",
  "redFlags": ["upsell attempt 1", "upsell attempt 2", "upsell attempt 3"]
}`;

  try {
    // ── 4. Groq API call ────────────────────────────────────────────────────
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a JSON-only API. You never respond with anything except valid raw JSON. No markdown, no backticks, no explanation."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";

    // Strip any accidental backticks/markdown
    const clean = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // Extract JSON object even if there's surrounding text
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in response");

    const parsed = JSON.parse(match[0]);

    // ── 5. Save to Supabase ─────────────────────────────────────────────────
    await service.from("diagnoses").insert({
      user_id: user.id,
      brand,
      model,
      year,
      symptom,
      result: parsed,
    });

    // Return result along with usage info
    return NextResponse.json({
      ...parsed,
      _meta: {
        diagnosesUsed: diagnosisCount + 1,
        freeLimit: FREE_LIMIT,
        isSubscribed,
      },
    });

  } catch (e) {
    console.error("Diagnosis error:", e);
    return NextResponse.json(
      { error: "Failed to parse diagnosis. Check your GROQ_API_KEY in .env.local" },
      { status: 500 }
    );
  }
}