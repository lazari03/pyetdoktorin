import { Notification, AppointmentNotification } from '../../../domain/entities/Notification';
import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';

export class FirebaseNotificationRepository implements INotificationRepository {
  private readonly collectionName = 'notifications';

  async getById(id: string): Promise<Notification | null> {
    try {
      const { getFirestore, doc, getDoc } = await import('firebase/firestore');
      const db = getFirestore();
      const notificationRef = doc(db, this.collectionName, id);
      const snapshot = await getDoc(notificationRef);
      
      if (!snapshot.exists()) return null;
      
      const data = snapshot.data();
      return Notification.create({
        id: snapshot.id,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data,
        read: data.read,
        dismissed: data.dismissed,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
      });
    } catch (error) {
      console.error('Error getting notification by ID:', error);
      throw error;
    }
  }

  async create(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    try {
      const { getFirestore, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const db = getFirestore();
      const notificationsRef = collection(db, this.collectionName);
      
      const docRef = await addDoc(notificationsRef, {
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        read: notification.read,
        dismissed: notification.dismissed,
        createdAt: serverTimestamp()
      });

      const createdNotification = await this.getById(docRef.id);
      if (!createdNotification) {
        throw new Error('Failed to create notification');
      }

      return createdNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async update(id: string, updates: Partial<Notification>): Promise<Notification> {
    try {
      const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
      const db = getFirestore();
      const notificationRef = doc(db, this.collectionName, id);
      
      const updateData: any = {};
      if (updates.read !== undefined) updateData.read = updates.read;
      if (updates.dismissed !== undefined) updateData.dismissed = updates.dismissed;
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.message !== undefined) updateData.message = updates.message;
      if (updates.data !== undefined) updateData.data = updates.data;

      await updateDoc(notificationRef, updateData);

      const updatedNotification = await this.getById(id);
      if (!updatedNotification) {
        throw new Error('Notification not found after update');
      }

      return updatedNotification;
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
      const db = getFirestore();
      const notificationRef = doc(db, this.collectionName, id);
      await deleteDoc(notificationRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const { getFirestore, collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
      const db = getFirestore();
      const notificationsRef = collection(db, this.collectionName);
      
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return this.mapSnapshotToNotifications(snapshot);
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    try {
      const { getFirestore, collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
      const db = getFirestore();
      const notificationsRef = collection(db, this.collectionName);
      
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return this.mapSnapshotToNotifications(snapshot);
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      throw error;
    }
  }

  async getActiveNotifications(userId: string): Promise<Notification[]> {
    try {
      const { getFirestore, collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
      const db = getFirestore();
      const notificationsRef = collection(db, this.collectionName);
      
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('dismissed', '==', false),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return this.mapSnapshotToNotifications(snapshot);
    } catch (error) {
      console.error('Error getting active notifications:', error);
      throw error;
    }
  }

  async getAppointmentNotifications(userId: string): Promise<AppointmentNotification[]> {
    try {
      const { getFirestore, collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
      const db = getFirestore();
      const notificationsRef = collection(db, this.collectionName);
      
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('type', '==', 'appointment'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const notifications = this.mapSnapshotToNotifications(snapshot);
      
      return notifications.map(notification => {
        return AppointmentNotification.create({
          id: notification.id,
          userId: notification.userId,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          read: notification.read,
          dismissed: notification.dismissed,
          createdAt: notification.createdAt,
          appointmentId: notification.data?.appointmentId || '',
          action: notification.data?.action || 'created'
        });
      });
    } catch (error) {
      console.error('Error getting appointment notifications:', error);
      throw error;
    }
  }

  async getPaymentNotifications(userId: string): Promise<Notification[]> {
    return await this.getNotificationsByType(userId, 'payment');
  }

  async getSystemNotifications(userId: string): Promise<Notification[]> {
    return await this.getNotificationsByType(userId, 'system');
  }

  private async getNotificationsByType(userId: string, type: string): Promise<Notification[]> {
    try {
      const { getFirestore, collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
      const db = getFirestore();
      const notificationsRef = collection(db, this.collectionName);
      
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('type', '==', type),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return this.mapSnapshotToNotifications(snapshot);
    } catch (error) {
      console.error('Error getting notifications by type:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return await this.update(notificationId, { read: true });
  }

  async markMultipleAsRead(notificationIds: string[]): Promise<Notification[]> {
    const updatedNotifications: Notification[] = [];
    
    // Process in parallel with batching
    const batchSize = 10;
    for (let i = 0; i < notificationIds.length; i += batchSize) {
      const batch = notificationIds.slice(i, i + batchSize);
      const batchPromises = batch.map(id => this.markAsRead(id));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          updatedNotifications.push(result.value);
        } else {
          console.error(`Failed to mark notification ${batch[index]} as read:`, result.reason);
        }
      });
    }
    
    return updatedNotifications;
  }

  async dismissNotification(notificationId: string): Promise<Notification> {
    return await this.update(notificationId, { dismissed: true });
  }

  async dismissMultiple(notificationIds: string[]): Promise<Notification[]> {
    const updatedNotifications: Notification[] = [];
    
    const batchSize = 10;
    for (let i = 0; i < notificationIds.length; i += batchSize) {
      const batch = notificationIds.slice(i, i + batchSize);
      const batchPromises = batch.map(id => this.dismissNotification(id));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          updatedNotifications.push(result.value);
        } else {
          console.error(`Failed to dismiss notification ${batch[index]}:`, result.reason);
        }
      });
    }
    
    return updatedNotifications;
  }

  async markAllAsRead(userId: string): Promise<Notification[]> {
    const unreadNotifications = await this.getUnreadNotifications(userId);
    const notificationIds = unreadNotifications.map(n => n.id);
    return await this.markMultipleAsRead(notificationIds);
  }

  async dismissAll(userId: string): Promise<Notification[]> {
    const activeNotifications = await this.getActiveNotifications(userId);
    const notificationIds = activeNotifications.map(n => n.id);
    return await this.dismissMultiple(notificationIds);
  }

  async deleteReadNotifications(userId: string): Promise<void> {
    try {
      const { getFirestore, collection, query, where, getDocs, deleteDoc, doc } = await import('firebase/firestore');
      const db = getFirestore();
      const notificationsRef = collection(db, this.collectionName);
      
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', true)
      );
      
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(docSnapshot => 
        deleteDoc(doc(db, this.collectionName, docSnapshot.id))
      );
      
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      throw error;
    }
  }

  async findByDateRange(userId: string, startDate: string, endDate: string): Promise<Notification[]> {
    try {
      const { getFirestore, collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
      const db = getFirestore();
      const notificationsRef = collection(db, this.collectionName);
      
      // Note: This is a simplified approach. In production, you might want to 
      // use a more sophisticated indexing strategy or composite indexes
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('createdAt', '>=', new Date(startDate)),
        where('createdAt', '<=', new Date(endDate)),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return this.mapSnapshotToNotifications(snapshot);
    } catch (error) {
      console.error('Error finding notifications by date range:', error);
      throw error;
    }
  }

  async findByType(userId: string, type: string): Promise<Notification[]> {
    return await this.getNotificationsByType(userId, type);
  }

  subscribeToUserNotifications(
    userId: string, 
    callback: (notifications: Notification[]) => void
  ): () => void {
    let unsubscribe: (() => void) | null = null;
    
    const setupSubscription = async () => {
      try {
        const { getFirestore, collection, query, where, orderBy, onSnapshot } = await import('firebase/firestore');
        const db = getFirestore();
        const notificationsRef = collection(db, this.collectionName);
        
        const q = query(
          notificationsRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const notifications = snapshot.docs.map(doc => {
            const data = doc.data();
            return Notification.create({
              id: doc.id,
              userId: data.userId,
              type: data.type,
              title: data.title,
              message: data.message,
              data: data.data,
              read: data.read,
              dismissed: data.dismissed,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
            });
          });
          
          callback(notifications);
        });
      } catch (error) {
        console.error('Error setting up notification subscription:', error);
      }
    };
    
    setupSubscription();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }

  async deleteOldNotifications(daysOld: number): Promise<number> {
    try {
      const { getFirestore, collection, query, where, getDocs, deleteDoc, doc } = await import('firebase/firestore');
      const db = getFirestore();
      const notificationsRef = collection(db, this.collectionName);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const q = query(
        notificationsRef,
        where('createdAt', '<', cutoffDate),
        where('read', '==', true)
      );
      
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(docSnapshot => 
        deleteDoc(doc(db, this.collectionName, docSnapshot.id))
      );
      
      await Promise.all(deletePromises);
      return snapshot.docs.length;
    } catch (error) {
      console.error('Error deleting old notifications:', error);
      throw error;
    }
  }

  private async mapSnapshotToNotifications(snapshot: any): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    snapshot.forEach((doc: any) => {
      const data = doc.data();
      notifications.push(Notification.create({
        id: doc.id,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data,
        read: data.read,
        dismissed: data.dismissed,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
      }));
    });

    return notifications;
  }
}