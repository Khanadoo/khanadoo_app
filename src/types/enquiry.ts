import { EnquiryStatus } from "./common";
import { Property } from "./property";

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

export interface EnquiryWithProperty extends Enquiry {
  property: Property;
}

export interface EnquiryUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface EnquiryWithUser extends Enquiry {
  user: EnquiryUser;
}
