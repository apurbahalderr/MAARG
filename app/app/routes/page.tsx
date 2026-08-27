import { redirect } from "next/navigation";

// /routes has been removed — redirect to route planner
export default function RoutesPage() {
  redirect("/user/dashboard");
}
