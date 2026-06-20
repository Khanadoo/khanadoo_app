import { apiFetch } from "@/lib/api";

import { Enquiry, EnquiryWithProperty, EnquiryWithUser } from "@/types/enquiry";

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
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(data),
    });
  },

  getMine() {
    return apiFetch<UserEnquiriesResponse>("/api/enquiry");
  },

  getProperty(propertyId: string) {
    return apiFetch<PropertyEnquiriesResponse>(
      `/api/enquiry/property/${propertyId}`,
    );
  },

  updateStatus(enquiryId: string, data: UpdateEnquiryPayload) {
    return apiFetch<UpdateEnquiryResponse>(`/api/enquiry/${enquiryId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};
