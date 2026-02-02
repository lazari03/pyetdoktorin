export type Pharmacy = {
  id: string;
  name: string;
};

export interface IPharmacyService {
  listPharmacies(): Promise<Pharmacy[]>;
}
