-- DropForeignKey
ALTER TABLE "cms_schema"."HeroImage" DROP CONSTRAINT "HeroImage_landingPageId_fkey";

-- DropForeignKey
ALTER TABLE "cms_schema"."Feature" DROP CONSTRAINT "Feature_landingPageId_fkey";

-- DropForeignKey
ALTER TABLE "cms_schema"."Testimonial" DROP CONSTRAINT "Testimonial_landingPageId_fkey";

-- DropForeignKey
ALTER TABLE "cms_schema"."PricingPlan" DROP CONSTRAINT "PricingPlan_landingPageId_fkey";

-- DropForeignKey
ALTER TABLE "cms_schema"."FAQ" DROP CONSTRAINT "FAQ_landingPageId_fkey";

-- DropForeignKey
ALTER TABLE "cms_schema"."FooterLink" DROP CONSTRAINT "FooterLink_landingPageId_fkey";

-- DropForeignKey
ALTER TABLE "cms_schema"."Documentation" DROP CONSTRAINT "Documentation_landingPageId_fkey";

-- DropTable
DROP TABLE "cms_schema"."LandingPage";

-- DropTable
DROP TABLE "cms_schema"."HeroImage";

-- DropTable
DROP TABLE "cms_schema"."Feature";

-- DropTable
DROP TABLE "cms_schema"."Testimonial";

-- DropTable
DROP TABLE "cms_schema"."PricingPlan";

-- DropTable
DROP TABLE "cms_schema"."FAQ";

-- DropTable
DROP TABLE "cms_schema"."FooterLink";

-- DropTable
DROP TABLE "cms_schema"."Documentation";
