import { apiFetch } from "@/lib/api";

import {
  Enquiry,
  EnquiryWithProperty,
  EnquiryWithUser,
  EnquiryWithUserAndProperty,
} from "@/types/enquiry";

import { EnquiryStatus } from "@/types/common";

export interface CreateEnquiryPayload {
  propertyId: string;
  phone: string;
  message?: string;
}

export interface CreateEnquiryResponse {
  success: boolean;
  enquiry: Enquiry;
}

export interface UserEnquiriesResponse {
  success: boolean;
  enquiries: EnquiryWithProperty[];
}

export interface PropertyEnquiriesResponse {
  success: boolean;
  enquiries: EnquiryWithUser[];
}

export interface OwnerEnquiriesResponse {
  success: boolean;
  enquiries: EnquiryWithUserAndProperty[];
}

export interface UpdateEnquiryPayload {
  status: EnquiryStatus;
}

export interface UpdateEnquiryResponse {
  success: boolean;
  enquiry: Enquiry;
}

export const enquiryClient = {
  create(data: CreateEnquiryPayload, accessToken: string) {
    return apiFetch<CreateEnquiryResponse>("/api/enquiry", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
  },

  getMine(accessToken: string) {
    return apiFetch<UserEnquiriesResponse>("/api/enquiry", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  getProperty(propertyId: string, accessToken: string) {
    return apiFetch<PropertyEnquiriesResponse>(
      `/api/enquiry/property/${propertyId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  },

  getOwner(accessToken: string) {
    return apiFetch<OwnerEnquiriesResponse>("/api/enquiry/owner", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  updateStatus(
    enquiryId: string,
    data: UpdateEnquiryPayload,
    accessToken: string,
  ) {
    return apiFetch<UpdateEnquiryResponse>(`/api/enquiry/${enquiryId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
  },
};
