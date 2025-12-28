import { redirect } from "next/navigation";

// Redirect to main Kanban view - drafts are now viewed there
export default function DraftsPage() {
  redirect("/");
}
