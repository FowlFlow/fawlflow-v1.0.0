"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="username">User Name</Label>
        <Input
          id="username"
          name="username"
          placeholder="john Deo"
          required
          autoFocus
          autoComplete="username"
          className="h-11 rounded-full px-4"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          required
          autoComplete="current-password"
          className="h-11 rounded-full px-4"
        />
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Forgot Password
          </Link>
        </div>
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-full text-base"
      >
        {pending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
        {pending ? "Signing in…" : "Sign In"}
      </Button>
    </form>
  );
}
