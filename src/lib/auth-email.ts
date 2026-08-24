import { authClient } from "@/lib/auth/client";

type Msg = { error: { message: string; code?: string } | null };

export type EmailAuthClient = {
  requestPasswordReset: (a: {
    email: string;
    redirectTo?: string;
  }) => Promise<Msg>;
  sendVerificationEmail: (a: {
    email: string;
    callbackURL?: string;
  }) => Promise<Msg>;
  changePassword: (a: {
    currentPassword: string;
    newPassword: string;
    revokeOtherSessions?: boolean;
  }) => Promise<Msg>;
  resetPassword: (a: { newPassword: string; token: string }) => Promise<Msg>;
};

export const emailAuth = authClient as unknown as typeof authClient &
  EmailAuthClient;
