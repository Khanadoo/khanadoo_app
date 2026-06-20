import { apiFetch } from "@/lib/api";

export interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  totalEnquiries: number;
  pendingEnquiries: number;
}

export interface DashboardProperty {
  id: string;
  title: string;
  city: string;
  locality: string;
  status: string;
  createdAt: string;
}

export interface DashboardEnquiry {
  id: string;
  phone: string;
  message?: string;
  status: string;

  property: {
    id: string;
    title: string;
  };

  user: {
    id: string;
    name: string;
    email: string;
  };

  createdAt: string;
}

export interface DashboardResponse {
  success: boolean;

  stats: DashboardStats;

  recentProperties: DashboardProperty[];

  recentEnquiries: DashboardEnquiry[];
}

export const ownerClient = {
  getDashboard(accessToken: string) {
    return apiFetch<DashboardResponse>("/api/owner/dashboard", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};
