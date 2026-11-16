import { requireSession } from "@/lib/auth";
import { DashboardNavigation } from "@/components/dashboard/navigation";
export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return (
    <div className="container dashboard-shell">
      <DashboardNavigation />
      <div className="dashboard-main">{children}</div>
    </div>
  );
}
