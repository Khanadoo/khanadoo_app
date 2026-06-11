import { EnquiryStatus } from "./common";

export interface Enquiry {
  id: string;

  userId: string;
  propertyId: string;

  phone: string;
  message?: string;

  status: EnquiryStatus;

  createdAt: string;
  updatedAt: string;
}