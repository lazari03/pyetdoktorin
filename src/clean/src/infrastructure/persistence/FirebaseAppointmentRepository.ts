import { Appointment, AppointmentStatus } from '../../../domain/entities/Appointment';
import { IAppointmentRepository } from '../../../domain/repositories/IAppointmentRepository';

export class FirebaseAppointmentRepository implements IAppointmentRepository {
  private readonly collectionName = 'appointments';

  async getById(id: string): Promise<Appointment | null> {
    try {
      const { getFirestore, doc, getDoc } = await import('firebase/firestore');
      const db = getFirestore();
      const appointmentRef = doc(db, this.collectionName, id);
      const snapshot = await getDoc(appointmentRef);
      
      if (!snapshot.exists()) return null;
      
      const data = snapshot.data();
      return Appointment.create({
        id: snapshot.id,
        doctorId: data.doctorId,
        doctorName: data.doctorName,
        patientId: data.patientId,
        patientName: data.patientName,
        appointmentType: data.appointmentType,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        notes: data.notes,
        isPaid: data.isPaid,
        createdAt: data.createdAt,
        status: data.status,
        roomId: data.roomId,
        roomCode: data.roomCode,
        dismissedBy: data.dismissedBy
      });
    } catch (error) {
      console.error('Error getting appointment by ID:', error);
      throw error;
    }
  }

  async create(appointment: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment> {
    try {
      const { getFirestore, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const db = getFirestore();
      const appointmentsRef = collection(db, this.collectionName);
      
      const docRef = await addDoc(appointmentsRef, {
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        appointmentType: appointment.appointmentType,
        preferredDate: appointment.preferredDate,
        preferredTime: appointment.preferredTime,
        notes: appointment.notes,
        isPaid: appointment.isPaid,
        status: appointment.status,
        roomId: appointment.roomId,
        roomCode: appointment.roomCode,
        dismissedBy: appointment.dismissedBy,
        createdAt: serverTimestamp()
      });

      // Get the created document
      const createdAppointment = await this.getById(docRef.id);
      if (!createdAppointment) {
        throw new Error('Failed to create appointment');
      }

      return createdAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async update(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    try {
      const { getFirestore, doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const db = getFirestore();
      const appointmentRef = doc(db, this.collectionName, id);
      
      const updateData: any = {};
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.isPaid !== undefined) updateData.isPaid = updates.isPaid;
      if (updates.roomId !== undefined) updateData.roomId = updates.roomId;
      if (updates.roomCode !== undefined) updateData.roomCode = updates.roomCode;
      if (updates.dismissedBy !== undefined) updateData.dismissedBy = updates.dismissedBy;
      
      updateData.updatedAt = serverTimestamp();

      await updateDoc(appointmentRef, updateData);

      const updatedAppointment = await this.getById(id);
      if (!updatedAppointment) {
        throw new Error('Appointment not found after update');
      }

      return updatedAppointment;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
      const db = getFirestore();
      const appointmentRef = doc(db, this.collectionName, id);
      await deleteDoc(appointmentRef);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }

  async getByUser(userId: string, isDoctor: boolean): Promise<Appointment[]> {
    try {
      const { getFirestore, collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
      const db = getFirestore();
      const appointmentsRef = collection(db, this.collectionName);
      
      const field = isDoctor ? 'doctorId' : 'patientId';
      const q = query(
        appointmentsRef,
        where(field, '==', userId),
        orderBy('preferredDate', 'desc'),
        orderBy('preferredTime', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const appointments: Appointment[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        appointments.push(Appointment.create({
          id: doc.id,
          doctorId: data.doctorId,
          doctorName: data.doctorName,
          patientId: data.patientId,
          patientName: data.patientName,
          appointmentType: data.appointmentType,
          preferredDate: data.preferredDate,
          preferredTime: data.preferredTime,
          notes: data.notes,
          isPaid: data.isPaid,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          status: data.status,
          roomId: data.roomId,
          roomCode: data.roomCode,
          dismissedBy: data.dismissedBy
        }));
      });

      return appointments;
    } catch (error) {
      console.error('Error getting appointments for user:', error);
      throw error;
    }
  }

  async getPendingAppointmentsForDoctor(doctorId: string): Promise<Appointment[]> {
    return this.getAppointmentsByDoctorAndStatus(doctorId, AppointmentStatus.PENDING);
  }

  async getConfirmedAppointmentsForDoctor(doctorId: string): Promise<Appointment[]> {
    return this.getAppointmentsByDoctorAndStatus(doctorId, AppointmentStatus.CONFIRMED);
  }

  async getPendingAppointmentsForPatient(patientId: string): Promise<Appointment[]> {
    return this.getAppointmentsByPatientAndStatus(patientId, AppointmentStatus.PENDING);
  }

  async getConfirmedAppointmentsForPatient(patientId: string): Promise<Appointment[]> {
    return this.getAppointmentsByPatientAndStatus(patientId, AppointmentStatus.CONFIRMED);
  }

  private async getAppointmentsByDoctorAndStatus(doctorId: string, status: AppointmentStatus): Promise<Appointment[]> {
    try {
      const { getFirestore, collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
      const db = getFirestore();
      const appointmentsRef = collection(db, this.collectionName);
      
      const q = query(
        appointmentsRef,
        where('doctorId', '==', doctorId),
        where('status', '==', status),
        orderBy('preferredDate', 'asc'),
        orderBy('preferredTime', 'asc')
      );
      
      const snapshot = await getDocs(q);
      return this.mapSnapshotToAppointments(snapshot);
    } catch (error) {
      console.error('Error getting appointments for doctor and status:', error);
      throw error;
    }
  }

  private async getAppointmentsByPatientAndStatus(patientId: string, status: AppointmentStatus): Promise<Appointment[]> {
    try {
      const { getFirestore, collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
      const db = getFirestore();
      const appointmentsRef = collection(db, this.collectionName);
      
      const q = query(
        appointmentsRef,
        where('patientId', '==', patientId),
        where('status', '==', status),
        orderBy('preferredDate', 'asc'),
        orderBy('preferredTime', 'asc')
      );
      
      const snapshot = await getDocs(q);
      return this.mapSnapshotToAppointments(snapshot);
    } catch (error) {
      console.error('Error getting appointments for patient and status:', error);
      throw error;
    }
  }

  private async mapSnapshotToAppointments(snapshot: any): Promise<Appointment[]> {
    const appointments: Appointment[] = [];
    
    snapshot.forEach((doc: any) => {
      const data = doc.data();
      appointments.push(Appointment.create({
        id: doc.id,
        doctorId: data.doctorId,
        doctorName: data.doctorName,
        patientId: data.patientId,
        patientName: data.patientName,
        appointmentType: data.appointmentType,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        notes: data.notes,
        isPaid: data.isPaid,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        status: data.status,
        roomId: data.roomId,
        roomCode: data.roomCode,
        dismissedBy: data.dismissedBy
      }));
    });

    return appointments;
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    return await this.update(id, { status });
  }

  async markAsPaid(id: string): Promise<Appointment> {
    return await this.update(id, { isPaid: true });
  }

  async findByDateRange(userId: string, startDate: string, endDate: string, isDoctor: boolean): Promise<Appointment[]> {
    // Note: Firebase doesn't support range queries on multiple fields
    // This would typically be handled client-side or with a more complex query structure
    const allAppointments = await this.getByUser(userId, isDoctor);
    
    return allAppointments.filter(appointment => {
      return appointment.preferredDate >= startDate && appointment.preferredDate <= endDate;
    });
  }

  async findByStatus(status: AppointmentStatus): Promise<Appointment[]> {
    try {
      const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
      const db = getFirestore();
      const appointmentsRef = collection(db, this.collectionName);
      
      const q = query(appointmentsRef, where('status', '==', status));
      const snapshot = await getDocs(q);
      
      return this.mapSnapshotToAppointments(snapshot);
    } catch (error) {
      console.error('Error finding appointments by status:', error);
      throw error;
    }
  }

  subscribeToUserAppointments(
    userId: string, 
    isDoctor: boolean, 
    callback: (appointments: Appointment[]) => void
  ): () => void {
    let unsubscribe: (() => void) | null = null;
    
    const setupSubscription = async () => {
      try {
        const { getFirestore, collection, query, where, orderBy, onSnapshot } = await import('firebase/firestore');
        const db = getFirestore();
        const appointmentsRef = collection(db, this.collectionName);
        
        const field = isDoctor ? 'doctorId' : 'patientId';
        const q = query(
          appointmentsRef,
          where(field, '==', userId),
          orderBy('preferredDate', 'desc'),
          orderBy('preferredTime', 'desc')
        );
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const appointments = snapshot.docs.map(doc => {
            const data = doc.data();
            return Appointment.create({
              id: doc.id,
              doctorId: data.doctorId,
              doctorName: data.doctorName,
              patientId: data.patientId,
              patientName: data.patientName,
              appointmentType: data.appointmentType,
              preferredDate: data.preferredDate,
              preferredTime: data.preferredTime,
              notes: data.notes,
              isPaid: data.isPaid,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
              status: data.status,
              roomId: data.roomId,
              roomCode: data.roomCode,
              dismissedBy: data.dismissedBy
            });
          });
          
          callback(appointments);
        });
      } catch (error) {
        console.error('Error setting up appointment subscription:', error);
      }
    };
    
    setupSubscription();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }

  async updateMultiple(updates: { id: string; changes: Partial<Appointment> }[]): Promise<Appointment[]> {
    const updatedAppointments: Appointment[] = [];
    
    // Process updates in parallel (limited to avoid overwhelming Firestore)
    const batchSize = 5;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      const batchPromises = batch.map(update => this.update(update.id, update.changes));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          updatedAppointments.push(result.value);
        } else {
          console.error(`Failed to update appointment ${batch[index].id}:`, result.reason);
        }
      });
    }
    
    return updatedAppointments;
  }
}