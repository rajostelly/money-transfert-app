import { redirect } from "next/navigation";

export default async function RegisterPage() {
  // Redirect to the new unified auth page with signup tab
  redirect("/auth?tab=signup");
}
