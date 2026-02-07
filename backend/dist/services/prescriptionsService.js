"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrescription = createPrescription;
exports.listPrescriptionsForRole = listPrescriptionsForRole;
exports.updatePrescriptionStatus = updatePrescriptionStatus;
const firebaseAdmin_1 = require("@/config/firebaseAdmin");
const UserRole_1 = require("@/domain/entities/UserRole");
const COLLECTION = 'recipe';
async function createPrescription(input) {
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const rawPayload = {
        ...input,
        status: 'pending',
        createdAt: Date.now(),
    };
    const payload = Object.fromEntries(Object.entries(rawPayload).filter(([, value]) => value !== undefined));
    const ref = await admin.firestore().collection(COLLECTION).add(payload);
    return { ...payload, id: ref.id };
}
async function listPrescriptionsForRole(uid, role) {
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    let query = admin.firestore().collection(COLLECTION).orderBy('createdAt', 'desc');
    if (role === UserRole_1.UserRole.Doctor) {
        query = query.where('doctorId', '==', uid);
    }
    else if (role === UserRole_1.UserRole.Patient) {
        query = query.where('patientId', '==', uid);
    }
    else if (role === UserRole_1.UserRole.Pharmacy) {
        query = query.where('pharmacyId', '==', uid);
    }
    const snapshot = await query.limit(200).get();
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}
async function updatePrescriptionStatus(id, status) {
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
        throw new Error('Invalid prescription status');
    }
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    await admin.firestore().collection(COLLECTION).doc(id).set({ status }, { merge: true });
}
//# sourceMappingURL=prescriptionsService.js.map
