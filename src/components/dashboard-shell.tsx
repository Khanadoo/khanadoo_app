"use client";

import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-shell grid gap-6 py-8 lg:grid-cols-[280px_minmax(0,1fr)]"
      >
        <Sidebar />
        <div>{children}</div>
      </motion.div>
    </ProtectedRoute>
  );
}
