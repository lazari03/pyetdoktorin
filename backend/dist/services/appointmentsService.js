"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAppointmentsForUser = listAppointmentsForUser;
exports.createAppointment = createAppointment;
exports.getAppointmentById = getAppointmentById;
exports.updateAppointmentStatus = updateAppointmentStatus;
exports.markAppointmentPaid = markAppointmentPaid;
const firebaseAdmin_1 = require("../config/firebaseAdmin");
const UserRole_1 = require("../domain/entities/UserRole");
const COLLECTION = 'appointments';
async function listAppointmentsForUser(uid, role) {
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const db = admin.firestore();
    const baseCollection = db.collection(COLLECTION);
    let filteredQuery = baseCollection;
    if (role === UserRole_1.UserRole.Patient) {
        filteredQuery = filteredQuery.where('patientId', '==', uid);
    }
    else if (role === UserRole_1.UserRole.Doctor) {
        filteredQuery = filteredQuery.where('doctorId', '==', uid);
    }
    else if (role === UserRole_1.UserRole.Clinic) {
        filteredQuery = filteredQuery.where('clinicId', '==', uid);
    }
    const mapDocs = (docs) => docs.map((doc) => {
        const data = doc.data();
        const normalizedNotes = data.notes ?? data.note;
        const base = { ...data, id: doc.id };
        if (normalizedNotes !== undefined) {
            base.notes = normalizedNotes;
        }
        return base;
    });
    try {
        const snapshot = await filteredQuery.orderBy('createdAt', 'desc').limit(200).get();
        return mapDocs(snapshot.docs);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : '';
        // Fallback for missing composite index in dev/preview environments.
        if (message.toLowerCase().includes('index')) {
            const snapshot = await filteredQuery.limit(200).get();
            const items = mapDocs(snapshot.docs);
            return items.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
        }
        throw error;
    }
}
async function createAppointment(input) {
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const db = admin.firestore();
    const { note, notes, ...rest } = input;
    const normalizedNotes = notes ?? note;
    const payload = {
        ...rest,
        status: 'pending',
        isPaid: false,
        createdAt: Date.now(),
    };
    if (normalizedNotes !== undefined) {
        payload.note = normalizedNotes;
        payload.notes = normalizedNotes;
    }
    const ref = await db.collection(COLLECTION).add(payload);
    return { id: ref.id, ...payload };
}
async function getAppointmentById(id) {
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const doc = await admin.firestore().collection(COLLECTION).doc(id).get();
    if (!doc.exists)
        return null;
    const data = doc.data();
    const normalizedNotes = data.notes ?? data.note;
    const base = { ...data, id: doc.id };
    if (normalizedNotes !== undefined) {
        base.notes = normalizedNotes;
    }
    return base;
}
async function updateAppointmentStatus(id, status, actor) {
    if (!['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
        throw new Error('Invalid status');
    }
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const updates = { status };
    if (status === 'accepted' && actor === UserRole_1.UserRole.Doctor) {
        updates.confirmedAt = Date.now();
    }
    await admin.firestore().collection(COLLECTION).doc(id).set(updates, { merge: true });
}
async function markAppointmentPaid(id, transactionId) {
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    await admin.firestore().collection(COLLECTION).doc(id).set({
        isPaid: true,
        paymentStatus: 'paid',
        transactionId,
        paidAt: Date.now(),
    }, { merge: true });
}
//# sourceMappingURL=appointmentsService.js.map