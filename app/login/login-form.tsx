"use client";

import { useState } from "react";

export function LoginForm({ from }: { from?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <form
      action="/api/auth/login"
      method="post"
      onSubmit={() => setBusy(true)}
      className="flex flex-col gap-3"
    >
      {from ? <input type="hidden" name="from" value={from} /> : null}
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
      </div>
      <button type="submit" disabled={busy} className="btn-primary mt-2">
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
