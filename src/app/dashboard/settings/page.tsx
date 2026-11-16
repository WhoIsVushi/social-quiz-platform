import { AccountSettings } from "@/components/dashboard/settings";
export const metadata = { title: "Hesap ayarları" };
export default function Page() {
  return (
    <>
      <div className="page-heading">
        <div>
          <h1 className="page-title">Kontrol sende.</h1>
          <p className="page-subtitle">Hesabın, güvenliğin ve gizlilik tercihlerin.</p>
        </div>
      </div>
      <AccountSettings />
    </>
  );
}
