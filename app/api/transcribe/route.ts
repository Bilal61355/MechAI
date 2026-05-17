import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  // 1. Auth check
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided." }, { status: 400 });
    }

    // Prepare FormData for Groq
    const groqFormData = new FormData();
    groqFormData.append("file", file);
    groqFormData.append("model", "whisper-large-v3");

    // 2. Groq Whisper API Call
    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: groqFormData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Groq Whisper error:", errorText);
      throw new Error(`Groq API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json({ error: "Failed to transcribe audio." }, { status: 500 });
  }
}
