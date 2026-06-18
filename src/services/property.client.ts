import { apiFetch } from "@/lib/api";
import { Property } from "@/types/property";

export interface PropertyListResponse {
  data: Property[];
  page: number;
  limit: number;
  total: number;
}

export const propertyClient = {
  getAll(page = 1, limit = 10) {
    return apiFetch<PropertyListResponse>(
      `/api/property?page=${page}&limit=${limit}`
    );
  },
};