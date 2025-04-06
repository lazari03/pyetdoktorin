export interface Doctor {
  id: string;
  name: string;
  expertise?: string[]; // Optional field for expertise
  specializations?: string[]; // Optional field for specializations
}
