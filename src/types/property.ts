import {
  PropertyPurpose,
  PropertyStatus,
  PropertyType,
} from "./common";
import { Enquiry } from "./enquiry";

import { User } from "./user";

export interface Property {
  id: string;

  title: string;
  description?: string;

  type: PropertyType;
  purpose: PropertyPurpose;
  status: PropertyStatus;

  price: number;

  city: string;
  locality: string;
  address: string;

  bedrooms?: number;
  bathrooms?: number;
  area?: number;

  imageUrls: string[];

  ownerId: string;

  owner?: User;

  featured: boolean;
  verified: boolean;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface PropertyOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface PropertyDetails extends Omit<Property, "owner"> {
  owner: PropertyOwner;
  enquiries: Enquiry[];
}