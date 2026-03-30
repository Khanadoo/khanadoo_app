"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import { useAppContext } from "@/providers/app-provider";
import type { UserRole } from "@/lib/types";

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { hydrated, user } = useAppContext();

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/home");
    }
  }, [allowedRoles, hydrated, pathname, router, user]);

  if (!hydrated || !user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return (
      <div className="page-shell py-8">
        <Loader lines={4} />
      </div>
    );
  }

  return <>{children}</>;
}
