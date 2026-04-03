"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, UserX, Ban, Loader2, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";

type AccountStatus = "ACTIVE" | "SUSPENDED" | "BANNED";

interface CustomerActionsProps {
  customerId: string;
  accountStatus: AccountStatus;
  customerName: string;
}

export function CustomerActions({ customerId, accountStatus, customerName }: CustomerActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function handleAction(action: AccountStatus) {
    const labels: Record<AccountStatus, string> = {
      ACTIVE: "restore full access for",
      SUSPENDED: "temporarily suspend",
      BANNED: "PERMANENTLY BAN",
    };

    const confirmMsg =
      action === "BANNED"
        ? `⚠️ PERMANENT ACTION!\n\nAre you absolutely sure you want to PERMANENTLY BAN ${customerName}?\n\nThis will:\n• Lock them out of their portal entirely\n• Block their email from ever re-registering\n• Revoke all access permanently\n\nThis action is very difficult to reverse.`
        : `Are you sure you want to ${labels[action]} ${customerName}?`;

    if (!confirm(confirmMsg)) return;

    // For permanent ban, ask for a reason
    let reason: string | undefined;
    if (action === "BANNED") {
      reason = prompt("Enter a reason for the ban (optional):") || undefined;
    }

    setLoading(action);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }

      router.refresh();
    } catch (error: any) {
      alert(`Failed: ${error.message}`);
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    if (!confirm(`⚠️ PERMANENT ACTION!\n\nAre you sure you want to permanently DELETE ${customerName}'s account?\n\nThis will remove all their data and cannot be undone.`)) return;

    setLoading("DELETE");
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      router.refresh();
    } catch (error: any) {
      alert(`Failed: ${error.message}`);
    } finally {
      setLoading(null);
    }
  }

  const isLoading = loading !== null;

  return (
    <div className="flex items-center gap-1.5">
      {/* Restore — Show only when NOT active */}
      {accountStatus !== "ACTIVE" && (
        <button
          onClick={() => handleAction("ACTIVE")}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-green-500/20 text-green-400 transition-colors"
          title="Restore Full Access"
        >
          {loading === "ACTIVE" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ShieldCheck className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Temporary Suspend — Show only when ACTIVE */}
      {accountStatus === "ACTIVE" && (
        <button
          onClick={() => handleAction("SUSPENDED")}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-yellow-500/20 text-yellow-400 transition-colors"
          title="Temporary Suspension (Read-Only)"
        >
          {loading === "SUSPENDED" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ShieldAlert className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Permanent Ban — Show when NOT banned */}
      {accountStatus !== "BANNED" && (
        <button
          onClick={() => handleAction("BANNED")}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
          title="Permanent Ban"
        >
          {loading === "BANNED" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Ban className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Delete Account — Always visible */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isLoading}
        className="p-2 rounded-lg hover:bg-rose-500/20 text-rose-500 transition-colors"
        title="Delete Account Permanently"
      >
        {loading === "DELETE" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
