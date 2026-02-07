export interface Clinic {
  id: string;
  name: string;
  address: string;
  description?: string;
  specialties: string[];
  phone: string;
  email: string;
  imageUrl?: string;
}
