import { fetchLandingPageData } from "@/lib/functions/fetchLandingPageData";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";

export const landingRouter = createTRPCRouter({
  getLandingInfo: baseProcedure.query(() => fetchLandingPageData()),
});
