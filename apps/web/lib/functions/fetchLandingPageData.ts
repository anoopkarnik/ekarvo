import type { LandingPageProps } from "@/lib/ts-types/landing";
import { landingPageData } from "@workspace/database/constants";

export async function fetchLandingPageData(): Promise<LandingPageProps> {
  return landingPageData as LandingPageProps;
}
