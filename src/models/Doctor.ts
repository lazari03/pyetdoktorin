export interface Doctor {
  id: string;
  name: string;
  expertise?: string[]; // Optional field for expertise
  specialization?: string[]; // Optional field for specializations
}
