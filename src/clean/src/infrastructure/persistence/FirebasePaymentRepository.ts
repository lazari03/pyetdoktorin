import { Payment, PaymentStatus, PaymentMethod } from '../../../domain/entities/Payment';
import { IPaymentRepository } from '../../../domain/repositories/IPaymentRepository';

export class FirebasePaymentRepository implements IPaymentRepository {
  private readonly collectionName = 'payments';

  async getById(id: string): Promise<Payment | null> {
    try {
      const { getFirestore, doc, getDoc } = await import('firebase/firestore');
      const db = getFirestore();
      const paymentRef = doc(db, this.collectionName, id);
      const snapshot = await getDoc(paymentRef);
      
      if (!snapshot.exists()) return null;
      
      const data = snapshot.data();
      return Payment.create({
        id: snapshot.id,
        appointmentId: data.appointmentId,
        userId: data.userId,
        amount: data.amount,
        status: data.status,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        completedAt: data.completedAt?.toDate?.()?.toISOString() || data.completedAt
      });
    } catch (error) {
      console.error('Error getting payment by ID:', error);
      throw error;
    }
  }

  async create(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    try {
      const { getFirestore, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const db = getFirestore();
      const paymentsRef = collection(db, this.collectionName);
      
      const docRef = await addDoc(paymentsRef, {
        appointmentId: payment.appointmentId,
        userId: payment.userId,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        createdAt: serverTimestamp(),
        completedAt: payment.completedAt ? serverTimestamp() : null
      });

      const createdPayment = await this.getById(docRef.id);
      if (!createdPayment) {
        throw new Error('Failed to create payment');
      }

      return createdPayment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async update(id: string, updates: Partial<Payment>): Promise<Payment> {
    try {
      const { getFirestore, doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const db = getFirestore();
      const paymentRef = doc(db, this.collectionName, id);
      
      const updateData: any = {};
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.transactionId !== undefined) updateData.transactionId = updates.transactionId;
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.paymentMethod !== undefined) updateData.paymentMethod = updates.paymentMethod;
      
      // Update completedAt timestamp when status changes to completed
      if (updates.status === PaymentStatus.COMPLETED) {
        updateData.completedAt = serverTimestamp();
      }
      
      updateData.updatedAt = serverTimestamp();

      await updateDoc(paymentRef, updateData);

      const updatedPayment = await this.getById(id);
      if (!updatedPayment) {
        throw new Error('Payment not found after update');
      }

      return updatedPayment;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
      const db = getFirestore();
      const paymentRef = doc(db, this.collectionName, id);
      await deleteDoc(paymentRef);
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    try {
      const { getFirestore, collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
      const db = getFirestore();
      const paymentsRef = collection(db, this.collectionName);
      
      const q = query(
        paymentsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return this.mapSnapshotToPayments(snapshot);
    } catch (error) {
      console.error('Error getting user payments:', error);
      throw error;
    }
  }

  async getPendingPayments(userId: string): Promise<Payment[]> {
    return await this.getPaymentsByUserAndStatus(userId, PaymentStatus.PENDING);
  }

  async getCompletedPayments(userId: string): Promise<Payment[]> {
    return await this.getPaymentsByUserAndStatus(userId, PaymentStatus.COMPLETED);
  }

  private async getPaymentsByUserAndStatus(userId: string, status: PaymentStatus): Promise<Payment[]> {
    try {
      const { getFirestore, collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
      const db = getFirestore();
      const paymentsRef = collection(db, this.collectionName);
      
      const q = query(
        paymentsRef,
        where('userId', '==', userId),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return this.mapSnapshotToPayments(snapshot);
    } catch (error) {
      console.error('Error getting payments by user and status:', error);
      throw error;
    }
  }

  async getPaymentByAppointment(appointmentId: string): Promise<Payment | null> {
    try {
      const { getFirestore, collection, query, where, getDocs, limit } = await import('firebase/firestore');
      const db = getFirestore();
      const paymentsRef = collection(db, this.collectionName);
      
      const q = query(
        paymentsRef,
        where('appointmentId', '==', appointmentId),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return Payment.create({
        id: doc.id,
        appointmentId: data.appointmentId,
        userId: data.userId,
        amount: data.amount,
        status: data.status,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        completedAt: data.completedAt?.toDate?.()?.toISOString() || data.completedAt
      });
    } catch (error) {
      console.error('Error getting payment by appointment:', error);
      throw error;
    }
  }

  async createPaymentForAppointment(
    appointmentId: string,
    userId: string,
    amount: { amount: number; currency: string },
    paymentMethod: PaymentMethod
  ): Promise<Payment> {
    const payment = Payment.createPending({
      id: '', // Will be generated by repository
      appointmentId,
      userId,
      amount,
      paymentMethod
    });

    return await this.create(payment);
  }

  async completePayment(paymentId: string, transactionId: string): Promise<Payment> {
    return await this.update(paymentId, { 
      status: PaymentStatus.COMPLETED,
      transactionId 
    });
  }

  async failPayment(paymentId: string): Promise<Payment> {
    return await this.update(paymentId, { status: PaymentStatus.FAILED });
  }

  async refundPayment(paymentId: string): Promise<Payment> {
    return await this.update(paymentId, { status: PaymentStatus.REFUNDED });
  }

  async getPaymentsByMethod(method: PaymentMethod): Promise<Payment[]> {
    try {
      const { getFirestore, collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
      const db = getFirestore();
      const paymentsRef = collection(db, this.collectionName);
      
      const q = query(
        paymentsRef,
        where('paymentMethod', '==', method),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return this.mapSnapshotToPayments(snapshot);
    } catch (error) {
      console.error('Error getting payments by method:', error);
      throw error;
    }
  }

  async findByDateRange(userId: string, startDate: string, endDate: string): Promise<Payment[]> {
    try {
      const { getFirestore, collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
      const db = getFirestore();
      const paymentsRef = collection(db, this.collectionName);
      
      const q = query(
        paymentsRef,
        where('userId', '==', userId),
        where('createdAt', '>=', new Date(startDate)),
        where('createdAt', '<=', new Date(endDate)),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return this.mapSnapshotToPayments(snapshot);
    } catch (error) {
      console.error('Error finding payments by date range:', error);
      throw error;
    }
  }

  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    try {
      const { getFirestore, collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
      const db = getFirestore();
      const paymentsRef = collection(db, this.collectionName);
      
      const q = query(
        paymentsRef,
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return this.mapSnapshotToPayments(snapshot);
    } catch (error) {
      console.error('Error finding payments by status:', error);
      throw error;
    }
  }

  async updateMultiple(updates: { id: string; changes: Partial<Payment> }[]): Promise<Payment[]> {
    const updatedPayments: Payment[] = [];
    
    // Process updates in parallel (limited to avoid overwhelming Firestore)
    const batchSize = 5;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      const batchPromises = batch.map(update => this.update(update.id, update.changes));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          updatedPayments.push(result.value);
        } else {
          console.error(`Failed to update payment ${batch[index].id}:`, result.reason);
        }
      });
    }
    
    return updatedPayments;
  }

  async getAllPayments(limit?: number, offset?: number): Promise<Payment[]> {
    try {
      const { getFirestore, collection, query, orderBy, limit: limitFn, getDocs } = await import('firebase/firestore');
      const db = getFirestore();
      const paymentsRef = collection(db, this.collectionName);
      
      let q = query(paymentsRef, orderBy('createdAt', 'desc'));
      
      if (limit) {
        q = query(q, limitFn(limit));
      }
      
      const snapshot = await getDocs(q);
      let payments = this.mapSnapshotToPayments(snapshot);
      
      // Apply offset client-side
      if (offset) {
        payments = payments.slice(offset);
      }
      
      return payments;
    } catch (error) {
      console.error('Error getting all payments:', error);
      throw error;
    }
  }

  async getPaymentStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
    failed: number;
    totalRevenue: number;
  }> {
    try {
      const [allPayments, completedPayments, pendingPayments, failedPayments] = await Promise.all([
        this.getAllPayments(1000), // Get up to 1000 payments
        this.findByStatus(PaymentStatus.COMPLETED),
        this.findByStatus(PaymentStatus.PENDING),
        this.findByStatus(PaymentStatus.FAILED)
      ]);

      const totalRevenue = completedPayments.reduce((sum, payment) => {
        return sum + payment.amount.amount;
      }, 0);

      return {
        total: allPayments.length,
        completed: completedPayments.length,
        pending: pendingPayments.length,
        failed: failedPayments.length,
        totalRevenue
      };
    } catch (error) {
      console.error('Error getting payment stats:', error);
      throw error;
    }
  }

  async getByTransactionId(transactionId: string): Promise<Payment | null> {
    try {
      const { getFirestore, collection, query, where, getDocs, limit } = await import('firebase/firestore');
      const db = getFirestore();
      const paymentsRef = collection(db, this.collectionName);
      
      const q = query(
        paymentsRef,
        where('transactionId', '==', transactionId),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return Payment.create({
        id: doc.id,
        appointmentId: data.appointmentId,
        userId: data.userId,
        amount: data.amount,
        status: data.status,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        completedAt: data.completedAt?.toDate?.()?.toISOString() || data.completedAt
      });
    } catch (error) {
      console.error('Error getting payment by transaction ID:', error);
      throw error;
    }
  }

  private async mapSnapshotToPayments(snapshot: any): Promise<Payment[]> {
    const payments: Payment[] = [];
    
    snapshot.forEach((doc: any) => {
      const data = doc.data();
      payments.push(Payment.create({
        id: doc.id,
        appointmentId: data.appointmentId,
        userId: data.userId,
        amount: data.amount,
        status: data.status,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        completedAt: data.completedAt?.toDate?.()?.toISOString() || data.completedAt
      }));
    });

    return payments;
  }
}