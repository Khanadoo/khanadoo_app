import { Role, UserStatus } from "./common";

export interface User {
  id: string;

  name: string;
  email: string;
  phone?: string;

  role: Role;
  status: UserStatus;

  createdAt: string;
  updatedAt: string;
}