import { AdminProvider } from "@/lib/adminStore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminProvider>{children}</AdminProvider>;
}
