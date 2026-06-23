import { apiFetch } from "@/lib/api";
import { Property, PropertyDetails } from "@/types/property";
import { PropertyFormValues } from "@/components/property/PropertyForm";

export interface PropertyListResponse {
  data: Property[];
  page: number;
  limit: number;
  total: number;
}

export interface MyPropertiesResponse {
  success: boolean;
  properties: Property[];
}

export const propertyClient = {
  getAll(page = 1, limit = 10) {
    return apiFetch<PropertyListResponse>(
      `/api/property?page=${page}&limit=${limit}`,
    );
  },

  getById(id: string) {
    return apiFetch<PropertyDetails>(`/api/property/${id}`);
  },

  getMyProperties(accessToken: string) {
    return apiFetch<MyPropertiesResponse>("/api/property/my", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  create(data: PropertyFormValues, accessToken: string) {
    return apiFetch<Property>("/api/property", {
      method: "POST",

      headers: {
        Authorization: `Bearer ${accessToken}`,
      },

      body: JSON.stringify(data),
    });
  },

  update(id: string, data: PropertyFormValues, accessToken: string) {
    return apiFetch<Property>(`/api/property/${id}`, {
      method: "PUT",

      headers: {
        Authorization: `Bearer ${accessToken}`,
      },

      body: JSON.stringify(data),
    });
  },

  delete(id: string, accessToken: string) {
    return apiFetch(`/api/property/${id}`, {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};
