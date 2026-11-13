import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@workspace/auth/better-auth/auth";
import db from "@workspace/database/client";
import { getActiveOrganizationId } from "@/trpc/org";
import StarterHome from "@/components/home/StarterHome";
export const dynamic = "force-dynamic";
export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/landing");
  if (session.user.role === "guest") return <StarterHome />;
  if (session.user.role === "admin") redirect("/admin/bpos");
  const activeId = await getActiveOrganizationId(session.session.id);
  const member = activeId
    ? await db.member.findUnique({
        where: {
          organizationId_userId: {
            organizationId: activeId,
            userId: session.user.id,
          },
        },
        include: { bpoAdmin: true, organization: { include: { bpo: true } } },
      })
    : null;
  if (
    member?.bpoAdmin &&
    member.organization.bpo &&
    !member.organization.bpo.suspended
  )
    redirect("/pulse/admin");
  redirect("/pulse");
}
