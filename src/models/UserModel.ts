import { UserRole } from "./UserRole";

export interface UserModel {
    education: string[]; 
    email: string;
    name: string;
    phone: string;
    phoneNumber: string;
    role: UserRole;     
    specializations: string[];
    surname: string;
  }

  