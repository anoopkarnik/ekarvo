import { getQueryClient, trpc } from "@/trpc/server";
import type { ReactElement } from "react";
import PrivacyPolicy from "@/blocks/landing/PrivacyPolicy";
import type { Metadata } from "next";
import { siteMetadata } from "@/lib/site-config/metadata";

export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  return siteMetadata({
    title: "Privacy Policy",
    description: "Read the privacy policy for this SaaS application.",
    pathname: "/landing/legal/privacy-policy",
  });
}

const Page = async (): Promise<ReactElement> => {
  const queryClient = getQueryClient();
  const data = await queryClient.ensureQueryData(
    trpc.landing.getLandingInfo.queryOptions(),
  );
  return <PrivacyPolicy privacyPolicy={data.privacyPolicy} />;
};

export default Page;
