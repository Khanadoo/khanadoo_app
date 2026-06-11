export type Role = "USER" | "OWNER" | "ADMIN";

export type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED";

export type PropertyType = "ROOM" | "PG" | "HOUSE" | "APARTMENT";

export type PropertyPurpose = "RENT" | "SALE";

export type PropertyStatus = "AVAILABLE" | "RENTED" | "SOLD";

export type EnquiryStatus =
  | "PENDING"
  | "CONTACTED"
  | "NEGOTIATING"
  | "CLOSED"
  | "CANCELLED";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
