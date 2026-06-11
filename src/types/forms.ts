import {
  PropertyPurpose,
  PropertyType,
} from "./common";

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface PropertyFormData {
  title: string;
  description?: string;

  type: PropertyType;
  purpose: PropertyPurpose;

  price: number;

  city: string;
  locality: string;
  address: string;

  bedrooms?: number;
  bathrooms?: number;
  area?: number;

  imageUrls: string[];
}

export interface EnquiryFormData {
  phone: string;
  message?: string;
}