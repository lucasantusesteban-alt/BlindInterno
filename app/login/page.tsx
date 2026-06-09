"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store";

export default function LoginPage() {
  const router = useRouter();
  const { login, currentUser } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) router.replace("/dashboard");
  }, [currentUser, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email.toLowerCase(), password);
      router.replace("/dashboard");
    } catch {
      setError("ACCESS DENIED. CHECK YOUR CREDENTIALS.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(240,240,238,0.5) 2px, rgba(240,240,238,0.5) 3px)",
          backgroundSize: "100% 8px",
        }}
      />

      {/* Corner tags */}
      <div className="absolute top-4 left-4 font-mono text-[10px] text-[#2a2a2a] tracking-widest">
        BS//UK-DRILL//92
      </div>
      <div className="absolute top-4 right-4 font-mono text-[10px] text-[#2a2a2a] tracking-widest">
        [ INTERNAL ACCESS ]
      </div>
      <div className="absolute bottom-4 left-4 font-mono text-[10px] text-[#2a2a2a] tracking-widest">
        CONTROL ROOM v1.0
      </div>
      <div className="absolute bottom-4 right-4 font-mono text-[10px] text-[#2a2a2a] tracking-widest">
        LDN//RAW
      </div>

      {/* Main card */}
      <div className="w-full max-w-sm relative z-10">
        {/* Access label */}
        <div className="mb-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#2a2a2a]" />
          <span className="font-mono text-[10px] tracking-[0.2em] text-[#8c8c8c]">
            RESTRICTED ZONE
          </span>
          <div className="h-px flex-1 bg-[#2a2a2a]" />
        </div>

        {/* Logo */}
        <div className="mb-2">
          <div
            className="text-[#c8102e] font-mono text-[10px] tracking-[0.3em] mb-3"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            BLINDSAINT / CONTROL ROOM
          </div>
          <h1
            className="text-[#f0f0ee] leading-none mb-1"
            style={{
              fontFamily: "var(--font-anton)",
              fontSize: "clamp(3rem, 12vw, 5rem)",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
              lineHeight: 0.9,
            }}
          >
            BLIND
            <br />
            SAINT
          </h1>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-2 h-2 bg-[#c8102e]" />
            <span
              className="text-[#f0f0ee] text-xs tracking-[0.25em]"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              OS — INTERNAL ACCESS ONLY
            </span>
          </div>
        </div>

        {/* Red accent line */}
        <div className="h-px bg-[#c8102e] mb-8 mt-6" />

        {/* Subtitle */}
        <p
          className="text-[#8c8c8c] text-[11px] tracking-[0.15em] mb-6 uppercase"
          style={{ fontFamily: "var(--font-space-mono)" }}
        >
          ONLY FOR THE ONES BUILDING THE DROP
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-[10px] tracking-[0.2em] text-[#8c8c8c] mb-2 uppercase"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@blindsaint.co"
              className="w-full bg-[#111111] border border-[#2a2a2a] text-[#f0f0ee] px-4 py-3 text-sm focus:border-[#c8102e] focus:outline-none transition-colors placeholder:text-[#2a2a2a]"
              style={{ fontFamily: "var(--font-space-mono)" }}
            />
          </div>

          <div>
            <label
              className="block text-[10px] tracking-[0.2em] text-[#8c8c8c] mb-2 uppercase"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full bg-[#111111] border border-[#2a2a2a] text-[#f0f0ee] px-4 py-3 text-sm focus:border-[#c8102e] focus:outline-none transition-colors placeholder:text-[#2a2a2a]"
              style={{ fontFamily: "var(--font-space-mono)" }}
            />
          </div>

          {error && (
            <div
              className="border border-[#c8102e] bg-[#3d0510] px-4 py-3 text-[#f0f0ee] text-[10px] tracking-[0.15em]"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c8102e] hover:bg-[#a00d24] disabled:bg-[#3d0510] text-[#f0f0ee] py-4 text-sm tracking-[0.3em] transition-colors font-bold mt-2"
            style={{
              fontFamily: "var(--font-anton)",
              textTransform: "uppercase",
              letterSpacing: "0.25em",
            }}
          >
            {loading ? "VERIFYING..." : "ENTER"}
          </button>
        </form>


        <p
          className="mt-6 text-center text-[#2a2a2a] text-[9px] tracking-[0.2em]"
          style={{ fontFamily: "var(--font-space-mono)" }}
        >
          INTERNAL ACCESS ONLY — DO NOT SHARE
        </p>
      </div>
    </div>
  );
}
