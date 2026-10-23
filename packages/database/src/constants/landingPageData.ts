import { navbarSectionData } from "./navbar";
import { footerSectionData } from "./footer";
import { cancellationRefundPoliciesData, privacyPolicyData, contactUsData, termsOfServiceData } from "./legal";

/** Static shell for the public legal pages. Landing interactions live in the web app. */
export const landingPageData = {
  navbarSection: navbarSectionData,
  heroSection: { tagline: "Work. Done. Verified.", description: "Operating intelligence. Autonomous execution." },
  featureSection: { heading: "EKARVO Platform", description: "Pulse + Drive", features: [] },
  testimonialSection: { heading: "", description: "", testimonials: [] },
  pricingSection: { heading: "", description: "", plans: [] },
  faqSection: { heading: "", description: "", faqs: [] },
  footerSection: footerSectionData,
  cancellationRefundPolicies: cancellationRefundPoliciesData,
  privacyPolicy: privacyPolicyData,
  contactUs: contactUsData,
  termsOfService: termsOfServiceData,
};
