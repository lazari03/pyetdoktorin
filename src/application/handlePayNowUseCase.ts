export class HandlePayNowUseCase {
  constructor() {}

  async execute(appointmentId: string, _amount?: number): Promise<void> {
    if (!appointmentId) throw new Error('Missing appointment id');
    window.location.href = `/dashboard/pay?appointmentId=${encodeURIComponent(
      appointmentId
    )}`;
  }
}
