"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Activity,
  SlidersHorizontal,
  Calendar,
  ShieldCheck,
  Users,
  CheckCircle2,
  Database,
  Building2,
  Network,
  Upload,
  ArrowLeftRight,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/shadcn/sidebar";
import {
  pulseSuites,
  pulseAdminSections,
  selectedSuite,
  selectedAdminSection,
} from "@/lib/pulse/navigation";
import { usePulseWorkspace } from "./usePulseWorkspace";
import { usePulseText } from "./ui";

const suiteIcons = [
  Activity,
  SlidersHorizontal,
  Calendar,
  ShieldCheck,
  Users,
  CheckCircle2,
  Database,
];
const adminIcons = [Users, Building2, Network, Upload, ArrowLeftRight];
export function PulseNavigation() {
  const { organization } = usePulseWorkspace();
  const t = usePulseText(),
    pathname = usePathname(),
    params = useSearchParams();
  const { setOpenMobile } = useSidebar();
  if (!organization || organization.suspended) return null;
  const admin = organization.isItAdmin;
  if (!admin && !organization.accounts.length) return null;
  const sections = admin ? pulseAdminSections : pulseSuites;
  const selected = admin
    ? selectedAdminSection(params.get("tab"))
    : selectedSuite(params.get("suite"));
  const target = admin ? "/pulse/admin" : "/pulse";
  return (
    <nav aria-label={t("navigation")}>
      <SidebarGroup>
        <SidebarGroupLabel>
          {t(admin ? "admin" : "operationsNavigation")}
        </SidebarGroupLabel>
        <SidebarMenu className="gap-1">
          {sections.map((section, index) => {
            const Icon = (admin ? adminIcons : suiteIcons)[index]!;
            const active = pathname === target && section === selected;
            return (
              <SidebarMenuItem key={section}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={t(section)}
                  className="min-h-11 h-auto"
                  onClick={() => setOpenMobile(false)}
                >
                  <Link
                    href={`${target}?${admin ? "tab" : "suite"}=${section}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{t(section)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    </nav>
  );
}
