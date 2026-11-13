import db from "@workspace/database/client";
import { notify } from "@/lib/notifications/notify";
import { pulseActionUpdated } from "@/lib/notifications/catalog";
import { accountAccess } from "./access";
import { logger } from "@workspace/observability/winston-logger";
export async function notifyActionOwner(input: {
  organizationId: string;
  accountId: string;
  ownerId: string;
  id: string;
  version: number;
  status: string;
}) {
  try {
    await accountAccess(input.ownerId, input.organizationId, input.accountId);
    const user = await db.user.findUnique({
      where: { id: input.ownerId },
      select: { locale: true },
    });
    await notify(
      pulseActionUpdated,
      input.ownerId,
      { status: input.status, locale: user?.locale || undefined },
      {
        organizationId: input.organizationId,
        dedupeKey: `pulse:${input.id}:${input.version}`,
      },
    );
  } catch {
    logger.warn("Pulse action notification was unavailable", {
      interventionId: input.id,
    });
  }
}
