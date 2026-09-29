"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { login, type LoginState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label htmlFor="admin-password" className="mb-2 block font-mono text-[0.64rem] uppercase tracking-[0.14em] text-steel">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "admin-login-err" : undefined}
          className="h-12 w-full bg-mist px-4 text-sm ring-1 ring-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-graphite"
        />
      </div>
      {state.error && (
        <p id="admin-login-err" role="alert" className="flex items-center gap-2 text-sm text-[#a3222a]">
          <AlertCircle aria-hidden className="size-4" /> {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 bg-graphite text-sm font-semibold text-white transition-colors hover:bg-ink disabled:opacity-70"
      >
        {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
