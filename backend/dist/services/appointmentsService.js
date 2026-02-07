"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAppointmentsForUser = listAppointmentsForUser;
exports.createAppointment = createAppointment;
exports.getAppointmentById = getAppointmentById;
exports.updateAppointmentStatus = updateAppointmentStatus;
exports.markAppointmentPaid = markAppointmentPaid;
const firebaseAdmin_1 = require("@/config/firebaseAdmin");
const UserRole_1 = require("@/domain/entities/UserRole");
const COLLECTION = 'appointments';
async function listAppointmentsForUser(uid, role) {
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const db = admin.firestore();
    let query = db.collection(COLLECTION).orderBy('createdAt', 'desc').limit(200);
    if (role === UserRole_1.UserRole.Patient) {
        query = query.where('patientId', '==', uid);
    }
    else if (role === UserRole_1.UserRole.Doctor) {
        query = query.where('doctorId', '==', uid);
    }
    else if (role === UserRole_1.UserRole.Clinic) {
        query = query.where('clinicId', '==', uid);
    }
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}
async function createAppointment(input) {
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const db = admin.firestore();
    const payload = {
        ...input,
        status: 'pending',
        isPaid: false,
        createdAt: Date.now(),
    };
    const ref = await db.collection(COLLECTION).add(payload);
    return { id: ref.id, ...payload };
}
async function getAppointmentById(id) {
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const doc = await admin.firestore().collection(COLLECTION).doc(id).get();
    if (!doc.exists)
        return null;
    return { ...doc.data(), id: doc.id };
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