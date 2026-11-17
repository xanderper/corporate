import { Suspense } from "react";
import { InviteAcceptClient } from "./InviteAcceptClient";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-virex-warmwhite" />}>
      <InviteAcceptClient token={token} />
    </Suspense>
  );
}
