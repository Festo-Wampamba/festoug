"use client";

import { useActionState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { updateProfile, type ProfileActionState } from "@/actions/user";
import { UserCircle, Loader2 } from "lucide-react";

export function SettingsNameForm({ initialName }: { initialName: string }) {
  const { update: updateSession } = useSession();
  const [state, formAction, pending] = useActionState<ProfileActionState, FormData>(
    updateProfile,
    null
  );

  useEffect(() => {
    if (state?.success) {
      updateSession();
    }
  }, [state, updateSession]);

  return (
    <div>
      <label
        htmlFor="name"
        className="block text-sm font-medium text-light-gray flex items-center gap-2 mb-2"
      >
        <UserCircle className="w-4 h-4" /> Full Name
      </label>
      <form action={formAction} className="flex gap-3">
        <input
          id="name"
          type="text"
          name="name"
          defaultValue={initialName}
          required
          maxLength={100}
          className="flex-1 bg-eerie-black-2 border border-jet text-white-2 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-yellow-crayola/50 focus:ring-1 focus:ring-orange-yellow-crayola/50 transition-all placeholder:text-light-gray-70"
          placeholder="Your full name"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 bg-orange-yellow-crayola text-smoky-black px-5 py-3 rounded-xl font-semibold text-sm hover:bg-orange-yellow-crayola/90 transition-colors disabled:opacity-50 shrink-0"
        >
          {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {pending ? "Saving…" : "Save"}
        </button>
      </form>
      {state?.error && (
        <p className="text-red-400 text-xs mt-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-green-400 text-xs mt-2">Name updated successfully.</p>
      )}
    </div>
  );
}
