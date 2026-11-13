"use client";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { selectPulseOrganization } from "@/lib/pulse/navigation";

/** The sidebar session selection is the only workspace source of truth. */
export function usePulseWorkspace() {
  const trpc = useTRPC();
  const bootstrap = useQuery(trpc.pulse.bootstrap.queryOptions());
  const current = useQuery(trpc.organization.current.queryOptions());
  return {
    data: bootstrap.data,
    organization: selectPulseOrganization(
      bootstrap.data?.organizations || [],
      current.data?.active?.id || null,
    ),
    loading: bootstrap.isPending || current.isPending,
    error: bootstrap.error || current.error,
    refetch: () => Promise.all([bootstrap.refetch(), current.refetch()]),
  };
}
