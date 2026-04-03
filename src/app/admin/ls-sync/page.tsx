import { LsSyncClient } from "@/components/admin/ls-sync-client";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Admin | LS Product Sync" };

export default function LsSyncPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-light-gray hover:text-orange-yellow-crayola transition-colors text-sm font-medium mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h2 className="text-white-2 text-xl font-bold">Lemon Squeezy Product Sync</h2>
        <p className="text-light-gray-70 text-sm mt-1">
          Import your Lemon Squeezy products into the database so orders sync automatically via webhook.
        </p>
      </div>

      <LsSyncClient />
    </div>
  );
}
