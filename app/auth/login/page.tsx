import { redirect } from "next/navigation";

export default async function LoginPage() {
  // Redirect to the new unified auth page with signin tab
  redirect("/auth?tab=signin");
}
