import { Suspense } from "react";
import { UserManagementClient } from "./UserManagementClient";

export default function UsersAdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-virex-warmwhite" />}>
      <UserManagementClient />
    </Suspense>
  );
}
