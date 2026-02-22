import { create } from 'zustand';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

interface NewAppointmentState {
  selectedDoctor: Doctor | null;
  appointmentType: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  setSelectedDoctor: (doctor: Doctor | null) => void;
  setAppointmentType: (type: string) => void;
  setPreferredDate: (date: string) => void;
  setPreferredTime: (time: string) => void;
  setNotes: (notes: string) => void;
  resetAppointment: () => void;
}

export const useNewAppointmentStore = create<NewAppointmentState>((set) => ({
  selectedDoctor: null,
  appointmentType: 'Check-up',
  preferredDate: '',
  preferredTime: '',
  notes: '',
  setSelectedDoctor: (doctor) => set({ selectedDoctor: doctor }),
  setAppointmentType: (type) => set({ appointmentType: type }),
  setPreferredDate: (date) => set({ preferredDate: date }),
  setPreferredTime: (time) => set({ preferredTime: time }),
  setNotes: (notes) => set({ notes }),
  resetAppointment: () =>
    set({
      selectedDoctor: null,
      appointmentType: 'Check-up',
      preferredDate: '',
      preferredTime: '',
      notes: '',
    }),
}));
