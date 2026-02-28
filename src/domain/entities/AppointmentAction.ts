export const AppointmentActionKey = {
  Past: 'past',
  Completed: 'completed',
  JoinNow: 'joinNow',
  PayNow: 'payNow',
  Pending: 'pending',
  Declined: 'declined',
  Rejected: 'rejected',
  WaitingForPayment: 'waitingForPayment',
  WaitingForAcceptance: 'waitingForAcceptance',
  None: '',
} as const;

export type AppointmentActionKey = (typeof AppointmentActionKey)[keyof typeof AppointmentActionKey];
