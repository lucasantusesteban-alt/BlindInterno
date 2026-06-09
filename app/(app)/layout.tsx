"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser, loading, init } = useAppStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    init().then(() => setInitialized(true));
  }, [init]);

  useEffect(() => {
    if (initialized && !currentUser) {
      router.replace("/login");
    }
  }, [initialized, currentUser, router]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div
          className="text-[#2a2a2a] text-[10px] tracking-[0.3em]"
          style={{ fontFamily: "var(--font-space-mono)" }}
        >
          BS//OS — LOADING...
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
