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
  getAll(
    page = 1,
    limit = 10,
    filters?: {
      city?: string;
      locality?: string;
      type?: string;
      purpose?: string;
      minPrice?: number;
      maxPrice?: number;
      sort?: string;
    },
  ) {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("limit", String(limit));

    if (filters?.city) {
      params.set("city", filters.city);
    }

    if (filters?.locality) {
      params.set("locality", filters.locality);
    }

    if (filters?.type) {
      params.set("type", filters.type);
    }

    if (filters?.purpose) {
      params.set("purpose", filters.purpose);
    }

    if (filters?.minPrice !== undefined) {
      params.set("minPrice", String(filters.minPrice));
    }

    if (filters?.maxPrice !== undefined) {
      params.set("maxPrice", String(filters.maxPrice));
    }

    if (filters?.sort) {
      params.set("sort", filters.sort);
    }

    return apiFetch<PropertyListResponse>(`/api/property?${params.toString()}`);
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

  updateStatus(
    id: string,
    status: "AVAILABLE" | "RENTED" | "SOLD",
    accessToken: string,
  ) {
    return apiFetch<Property>(`/api/property/${id}`, {
      method: "PUT",

      headers: {
        Authorization: `Bearer ${accessToken}`,
      },

      body: JSON.stringify({
        status,
      }),
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
