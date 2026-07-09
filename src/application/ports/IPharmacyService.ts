export interface Pharmacy {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

export interface IPharmacyService {
  listPharmacies(): Promise<Pharmacy[]>;
}
