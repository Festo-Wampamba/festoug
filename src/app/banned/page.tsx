import { Ban } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Account Banned" };

export default function BannedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-smoky-black p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
          <Ban className="w-10 h-10 text-red-400" />
        </div>

        <h1 className="text-white-2 text-2xl font-bold">Account Permanently Banned</h1>

        <p className="text-light-gray leading-relaxed">
          Your account has been permanently banned for violating our terms of service.
          You no longer have access to your dashboard, purchases, or any other services.
        </p>

        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-sm">
            If you believe this is an error, please contact support at{" "}
            <a href="mailto:support@festoug.com" className="underline font-medium">
              support@festoug.com
            </a>
          </p>
        </div>

        <Link
          href="/"
          className="inline-block text-light-gray-70 hover:text-orange-yellow-crayola text-sm transition-colors"
        >
          ← Return to Home
        </Link>
      </div>
    </main>
  );
}
