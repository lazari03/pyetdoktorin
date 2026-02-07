import { Clinic } from '@/domain/entities/Clinic';

export const clinicsCatalog: Clinic[] = [
  {
    id: 'clinic-aurora',
    name: 'Aurora Health Clinic',
    address: 'Rruga e Durrësit 45, Tirana',
    description: 'Multi-specialty clinic focused on preventative care and chronic condition management.',
    specialties: ['Cardiology', 'Dermatology', 'Pediatrics'],
    phone: '+355 69 123 4567',
    email: 'contact@auroraclinic.al',
    imageUrl: '/images/clinics/aurora.jpg',
  },
  {
    id: 'clinic-harbor',
    name: 'Harbor Family Clinic',
    address: 'Bulevardi Zogu i Parë, Tirana',
    description: 'Family-first clinic offering quick consultations and lab diagnostics.',
    specialties: ['Family Medicine', 'Laboratory', 'Nutrition'],
    phone: '+355 68 987 6543',
    email: 'hello@harborclinic.al',
    imageUrl: '/images/clinics/harbor.jpg',
  },
  {
    id: 'clinic-prime',
    name: 'Prime Care Center',
    address: 'Rruga Ismail Qemali 12, Tirana',
    description: 'Premium outpatient services with same-day appointment availability.',
    specialties: ['Orthopedics', 'Physical Therapy', 'Radiology'],
    phone: '+355 67 222 3344',
    email: 'info@primecare.al',
    imageUrl: '/images/clinics/prime.jpg',
  },
];
