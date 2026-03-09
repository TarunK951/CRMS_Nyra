"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { addLeadActivity } from "@/app/actions/activities";
import { Mic, Square } from "lucide-react";

export default function ClinicActivityForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [activityType, setActivityType] = useState<"visit" | "meeting" | "note">("note");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  function startVoiceInput() {
    if (typeof window === "undefined" || !("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) {
      return;
    }
    const SpeechRecognitionAPI = (window as unknown as { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) {
        setContent((prev) => (prev ? prev + " " : "") + last[0].transcript);
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  }

  function stopVoiceInput() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    await addLeadActivity(leadId, activityType, content.trim());
    setContent("");
    setLoading(false);
    router.refresh();
  }

  const supportsVoice = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <select
        value={activityType}
        onChange={(e) => setActivityType(e.target.value as "visit" | "meeting" | "note")}
        className="input-focus rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground"
      >
        <option value="note">Note</option>
        <option value="visit">Visit</option>
        <option value="meeting">Meeting</option>
      </select>
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note... (or use voice input)"
          rows={3}
          className="input-focus w-full rounded-button border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground"
        />
        {supportsVoice && (
          <div className="absolute right-2 top-2">
            {!listening ? (
              <button type="button" onClick={startVoiceInput} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" title="Voice input">
                <Mic className="h-5 w-5" />
              </button>
            ) : (
              <button type="button" onClick={stopVoiceInput} className="rounded p-1.5 text-destructive hover:bg-muted" title="Stop">
                <Square className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>
      <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
        {loading ? "Saving..." : "Add activity"}
      </button>
    </form>
  );
}
