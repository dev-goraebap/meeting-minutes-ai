"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export function LoginPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;

    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token.trim() }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "로그인에 실패했어요.");
      setSubmitting(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-[var(--radius-card)] border border-border bg-surface p-8 shadow-[var(--shadow-token-md)]"
      >
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-[var(--radius-control)] bg-accent text-caption font-bold text-white">
            회
          </span>
          <span className="text-body font-bold text-ink">회의록</span>
        </div>

        <h1 className="mt-6 text-detail-h1 font-bold text-ink">로그인</h1>
        <p className="mt-1 text-body text-ink-secondary">
          발급받은 로그인 토큰을 입력해주세요.
        </p>

        <Input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="로그인 토큰"
          autoFocus
          autoComplete="off"
          className="mt-5 font-mono"
        />

        {error && <p className="mt-2 text-body text-status-failed">{error}</p>}

        <Button
          type="submit"
          disabled={!token.trim() || submitting}
          className="mt-5 w-full"
        >
          {submitting ? "확인 중…" : "로그인"}
        </Button>
      </form>
    </main>
  );
}
