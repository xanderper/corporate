import { redirect } from "next/navigation";

export default function AdminUsersRedirect() {
  redirect("/portal/admin/users");
}
