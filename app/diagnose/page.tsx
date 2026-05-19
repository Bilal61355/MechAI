"use client";
import { useState, useEffect, useRef } from "react";
import FloatingTools from "@/components/FloatingTools";
import Paywall from "@/components/Paywall";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type Message = {
  role: "user" | "assistant";
  content: string | any[];
};

export default function DiagnoseChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm MechanicAI. Are you having an emergency with your vehicle? Let me know your city, your car/bike model, and what's wrong (you can use the mic or upload a photo)." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [imageBase64, setImageBase64] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const supabase = createClient();

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, input, imageBase64]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("upgrade") === "true") {
        setShowPaywall(true);
        window.history.replaceState(null, "", "/diagnose");
      }

      // Initialize SpeechRecognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setInput((prev) => prev + (prev ? " " : "") + finalTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          if (event.error === "not-allowed") {
            alert("Microphone access denied.");
          }
          setIsRecording(false);
        };
        
        recognition.onend = () => setIsRecording(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch (e) { console.error(e); }
      } else {
        alert("Speech Recognition not supported in this browser.");
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && !imageBase64) return;
    
    // Construct user message
    let userMsgContent: any = input.trim();
    if (imageBase64) {
      userMsgContent = [
        { type: "text", text: input.trim() || "Analyze this image for me." },
        { type: "image_url", image_url: { url: imageBase64 } }
      ];
    }

    const newMessage: Message = { role: "user", content: userMsgContent };
    const newMessages = [...messages, newMessage];
    
    setMessages(newMessages);
    setInput("");
    setImageBase64("");
    setLoading(true);

    try {
      const isNewChat = messages.length === 1; // Only the default greeting was there

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // We only send the messages minus the hardcoded first greeting for Groq (or we can send all)
        body: JSON.stringify({ 
          messages: newMessages.slice(1), 
          isNewChat, 
          chatId 
        }),
      });

      if (res.status === 401) { router.push("/login"); return; }
      if (res.status === 402) { setShowPaywall(true); setMessages(messages); setLoading(false); return; }
      
      if (!res.body) throw new Error("No response body");

      // Add empty assistant message placeholder to stream into
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value);
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = { ...updated[lastIndex], content: (updated[lastIndex].content as string) + chunk };
            return updated;
          });
        }
      }
      
      // If it's a new chat, we assume the backend saved it and generated an ID. 
      // For simplicity in MVP, we just rely on Supabase history for later.

    } catch (e) {
      console.error(e);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I had trouble connecting. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to render message content
  const renderMessageContent = (content: string | any[]) => {
    if (typeof content === 'string') return content;
    return (
      <div>
        {content.map((c, i) => {
          if (c.type === 'text') return <div key={i}>{c.text}</div>;
          if (c.type === 'image_url') return <img key={i} src={c.image_url.url} alt="upload" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '8px' }} />;
        })}
      </div>
    );
  };

  return (
    <div style={{ background: "#080808", height: "100vh", display: "flex", flexDirection: "column", color: "#f0ede8", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .bubble { padding: 0.9rem 1.1rem; border-radius: 16px; font-size: 0.95rem; line-height: 1.5; max-width: 85%; word-wrap: break-word; }
        .bubble-user { background: #e85d26; color: #fff; border-bottom-right-radius: 4px; margin-left: auto; }
        .bubble-ai { background: rgba(255,255,255,0.06); color: #f0ede8; border-bottom-left-radius: 4px; border: 1px solid rgba(255,255,255,0.05); }
        .pulse { width: 8px; height: 8px; background: #e85d26; border-radius: 50%; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.3; transform:scale(0.8); } }
      `}</style>

      {showPaywall && <Paywall onClose={() => setShowPaywall(false)} />}
      <FloatingTools />

      {/* Nav */}
      <nav style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(8,8,8,0.9)", backdropFilter: "blur(10px)" }}>
        <a href="/" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.1rem", textDecoration: "none", color: "#f0ede8" }}>
          Mechanic<span style={{ color: "#e85d26" }}>AI</span> <span style={{fontSize:'0.7rem', color:'rgba(255,255,255,0.3)', verticalAlign:'top'}}>Emergency</span>
        </a>
        <button onClick={handleSignOut} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "0.4rem 0.8rem", color: "rgba(240,237,232,0.4)", fontSize: "0.75rem", cursor: "pointer" }}>
          Sign Out
        </button>
      </nav>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", position: "relative", zIndex: 5 }}>
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
            {renderMessageContent(m.content)}
          </div>
        ))}
        {loading && <div className="bubble bubble-ai" style={{ display: "flex", gap: "5px", alignItems: "center" }}><span className="pulse"/><span className="pulse" style={{animationDelay:'0.2s'}}/><span className="pulse" style={{animationDelay:'0.4s'}}/></div>}
        <div ref={chatEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div style={{ position: "relative", zIndex: 10, background: "rgba(8,8,8,0.95)", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "1rem", paddingBottom: "env(safe-area-inset-bottom, 1rem)" }}>
        
        {imageBase64 && (
          <div style={{ position: "relative", display: "inline-block", marginBottom: "0.5rem" }}>
            <img src={imageBase64} alt="upload" style={{ height: "60px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }} />
            <button onClick={() => setImageBase64("")} style={{ position: "absolute", top: "-5px", right: "-5px", background: "#e85d26", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", fontSize: "10px", cursor: "pointer" }}>✕</button>
          </div>
        )}

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "45px", height: "45px", background: "rgba(255,255,255,0.05)", borderRadius: "22.5px", cursor: "pointer", color: "rgba(255,255,255,0.6)" }}>
            📷
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
          </label>
          
          <div style={{ flex: 1, position: "relative" }}>
            <textarea
              rows={input.split("\n").length > 1 ? 2 : 1}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Describe what happened..."
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "0.8rem 2.8rem 0.8rem 1rem", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", resize: "none", outline: "none" }}
            />
            <button 
              onClick={toggleRecording}
              style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: isRecording ? "#e85d26" : "rgba(255,255,255,0.4)", fontSize: "1.2rem" }}>
              🎤
            </button>
          </div>

          <button 
            onClick={sendMessage}
            disabled={(!input.trim() && !imageBase64) || loading}
            style={{ width: "45px", height: "45px", background: (!input.trim() && !imageBase64) ? "rgba(232,93,38,0.3)" : "#e85d26", borderRadius: "22.5px", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}