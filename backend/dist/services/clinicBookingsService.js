"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClinicBooking = createClinicBooking;
exports.listBookingsByClinic = listBookingsByClinic;
exports.listBookingsByPatient = listBookingsByPatient;
exports.listAllBookings = listAllBookings;
exports.updateClinicBookingStatus = updateClinicBookingStatus;
const firebaseAdmin_1 = require("@/config/firebaseAdmin");
const COLLECTION = 'clinicBookings';
async function createClinicBooking(input) {
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const payload = {
        ...input,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };
    const ref = await admin.firestore().collection(COLLECTION).add(payload);
    return { ...payload, id: ref.id };
}
async function listBookingsByClinic(clinicId) {
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const snapshot = await admin.firestore().collection(COLLECTION).where('clinicId', '==', clinicId).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}
async function listBookingsByPatient(patientId) {
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const snapshot = await admin.firestore().collection(COLLECTION).where('patientId', '==', patientId).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}
async function listAllBookings(limit = 500) {
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const snapshot = await admin.firestore().collection(COLLECTION).orderBy('createdAt', 'desc').limit(limit).get();
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}
async function updateClinicBookingStatus(id, status) {
    if (!['pending', 'confirmed', 'declined'].includes(status)) {
        throw new Error('Invalid clinic booking status');
    }
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    await admin.firestore().collection(COLLECTION).doc(id).set({ status }, { merge: true });
}
//# sourceMappingURL=clinicBookingsService.js.map