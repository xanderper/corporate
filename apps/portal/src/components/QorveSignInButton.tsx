"use client";

import { useQorveAuth } from "@qorve/react";

export function QorveSignInButton() {
  const { signIn } = useQorveAuth();
  
  return (
    <button
      type="button"
      onClick={() => signIn("login")}
      className="w-full px-8 py-4 bg-virex-forest text-virex-warmwhite font-medium tracking-wide hover:bg-virex-deepink transition-colors duration-300"
    >
      Authenticate with Qorve
    </button>
  );
}
