"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "@workspace/auth/better-auth/auth-client";
import { useChangeLocale } from "@/hooks/useChangeLocale";
import { SettingsDialog } from "@workspace/ui/components/home/SettingsDialog";
import type { SidebarUserProps } from "@workspace/ui/components/home/SidebarUser";
import UISidebarUser from "@workspace/ui/components/home/SidebarUser";
import { ApiKeysScreen } from "@/components/api-keys/ApiKeysScreen";

const SidebarUserContext = React.createContext<SidebarUserProps | null>(null);

export function SidebarUserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const router = useRouter();
  const trpc = useTRPC();
  const { data: session, status, refetch: refetchSession } = useSession();
  const changeLocale = useChangeLocale();

  const setPasswordMutation = useMutation(
    trpc.home.setPassword.mutationOptions(),
  );

  const onNavigate = (path: string) => {
    router.push(path);
  };

  const onSetPassword = async (data: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      await setPasswordMutation.mutateAsync({
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      await refetchSession();
      return {};
    } catch (e: any) {
      return { error: e.message };
    }
  };

  const onUpdateAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/settings/modifyAvatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }

      const data = await response.json();
      await refetchSession();
      return { url: data.url };
    } catch (e: any) {
      return { error: e.message };
    }
  };

  const userProps: SidebarUserProps = {
    session,
    status,
    onNavigate,
    onSetPassword,
    onUpdateAvatar,
    guestMail: process.env.NEXT_PUBLIC_GUEST_MAIL,
    adminMail: process.env.NEXT_PUBLIC_ADMIN_MAIL,
    onOpenSettings: () => setSettingsOpen(true),
    onLocaleChange: changeLocale,
    paymentGateway: "none",
    apiKeysContent: <ApiKeysScreen />,
  };
  return (
    <SidebarUserContext.Provider value={userProps}>
      {children}
      <SettingsDialog
        {...userProps}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </SidebarUserContext.Provider>
  );
}

const SidebarUser = () => {
  const props = React.useContext(SidebarUserContext);
  if (!props) throw new Error("SidebarUser requires SidebarUserProvider");
  return (
    <>
      <UISidebarUser {...props} />
    </>
  );
};

export default SidebarUser;
