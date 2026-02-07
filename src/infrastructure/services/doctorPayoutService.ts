import { IDoctorPayoutService, PayoutRecord } from '@/application/ports/IDoctorPayoutService';
import { getAdmin } from '@/app/api/_lib/admin';

/**
 * Firebase implementation of doctor payout tracking
 * Records payout records in Firestore 'doctorPayouts' collection
 */
export class DoctorPayoutService implements IDoctorPayoutService {
  private get db() {
    const { db } = getAdmin();
    return db;
  }

  private calculatePayoutAmount(totalAmount: number): number {
    const payoutPercentage = Number(process.env.DOCTOR_PAYOUT_PERCENTAGE ?? 70);
    return Math.round((totalAmount * payoutPercentage) / 100 * 100) / 100; // Round to 2 decimals
  }

  async recordPayout(appointmentId: string, doctorId: string, totalAmount: number): Promise<void> {
    const payoutAmount = this.calculatePayoutAmount(totalAmount);
    const platformFee = Math.round((totalAmount - payoutAmount) * 100) / 100;

    const payoutRecord: Omit<PayoutRecord, 'id'> = {
      appointmentId,
      doctorId,
      totalAmount,
      payoutAmount,
      platformFee,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await this.db.collection('doctorPayouts').add(payoutRecord);
  }

  async getPayoutStatus(appointmentId: string): Promise<PayoutRecord | null> {
    const snapshot = await this.db
      .collection('doctorPayouts')
      .where('appointmentId', '==', appointmentId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as PayoutRecord;
  }

  async listPendingPayouts(doctorId?: string): Promise<PayoutRecord[]> {
    let query = this.db
      .collection('doctorPayouts')
      .where('status', '==', 'pending');

    if (doctorId) {
      query = query.where('doctorId', '==', doctorId);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as PayoutRecord));
  }
}
