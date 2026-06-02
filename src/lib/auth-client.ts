"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { sentinelClient } from "@better-auth/infra/client";
import type { auth } from "@/lib/better-auth";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), sentinelClient()],
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  sendVerificationEmail,
  requestPasswordReset,
  resetPassword,
} = authClient;
