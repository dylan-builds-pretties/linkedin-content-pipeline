import { redirect } from "next/navigation";

// Redirect to main Kanban view - scheduled posts are now viewed there
export default function ScheduledPage() {
  redirect("/");
}
