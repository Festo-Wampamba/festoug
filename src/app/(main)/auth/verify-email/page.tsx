"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("No verification token found. Please use the link from your email.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (res.ok) {
          setStatus("success");
          setTimeout(() => router.push("/dashboard"), 2000);
        } else {
          const data = await res.json();
          setStatus("error");
          setErrorMsg(data.error || "Verification failed. Please request a new link.");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("An unexpected error occurred. Please try again.");
      });
  }, [token, router]);

  return (
    <div className="min-h-screen bg-cm-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-cm-surface border border-cm-border p-8 rounded-2xl shadow-2xl text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 text-cm-ocean animate-spin mx-auto mb-4" />
              <h1 className="text-cm-text text-2xl font-semibold mb-2">Verifying your email…</h1>
              <p className="text-cm-muted text-sm">Just a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h1 className="text-cm-text text-2xl font-semibold mb-2">Email verified!</h1>
              <p className="text-cm-muted text-sm">Redirecting you to your dashboard…</p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h1 className="text-cm-text text-2xl font-semibold mb-2">Verification failed</h1>
              <p className="text-cm-muted text-sm mb-6">{errorMsg}</p>
              <Link
                href="/dashboard"
                className="inline-block bg-cm-ocean text-cm-bg font-semibold text-sm py-2.5 px-6 rounded-xl hover:brightness-110 transition-all"
              >
                Go to Dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cm-bg flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-cm-ocean animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
