import { requireSession } from "@/lib/auth";
import { ProfileForm } from "@/components/dashboard/profile";
export const metadata = { title: "Profilim" };
export default async function Page() {
  const session = await requireSession();
  return (
    <>
      <div className="page-heading">
        <div>
          <h1 className="page-title">Senin köşen.</h1>
          <p className="page-subtitle">Küçük dokunuşlarla profilini kişiselleştir.</p>
        </div>
      </div>
      <ProfileForm
        initialName={session.user.name}
        email={session.user.email}
        initialImage={session.user.image || null}
      />
    </>
  );
}
