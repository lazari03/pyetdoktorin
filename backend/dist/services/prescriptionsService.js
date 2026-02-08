"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrescription = createPrescription;
exports.listPrescriptionsForRole = listPrescriptionsForRole;
exports.updatePrescriptionStatus = updatePrescriptionStatus;
exports.getPrescriptionById = getPrescriptionById;
const firebaseAdmin_1 = require("../config/firebaseAdmin");
const UserRole_1 = require("../domain/entities/UserRole");
const COLLECTION = 'recipe';
async function createPrescription(input) {
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const payload = {
        doctorId: input.doctorId,
        doctorName: input.doctorName,
        patientId: input.patientId,
        patientName: input.patientName,
        medicines: input.medicines,
        status: 'pending',
        createdAt: Date.now(),
        ...(input.pharmacyId !== undefined ? { pharmacyId: input.pharmacyId } : {}),
        ...(input.pharmacyName !== undefined ? { pharmacyName: input.pharmacyName } : {}),
        ...(input.dosage !== undefined ? { dosage: input.dosage } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.signatureDataUrl !== undefined ? { signatureDataUrl: input.signatureDataUrl } : {}),
    };
    const ref = await admin.firestore().collection(COLLECTION).add(payload);
    return { id: ref.id, ...payload };
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
    const mapDocs = (docs) => docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    try {
        const snapshot = await query.limit(200).get();
        return mapDocs(snapshot.docs);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : '';
        // Fallback for missing composite index in dev/preview environments.
        if (message.toLowerCase().includes('index')) {
            const base = admin.firestore().collection(COLLECTION);
            let fallbackQuery = base;
            if (role === UserRole_1.UserRole.Doctor) {
                fallbackQuery = fallbackQuery.where('doctorId', '==', uid);
            }
            else if (role === UserRole_1.UserRole.Patient) {
                fallbackQuery = fallbackQuery.where('patientId', '==', uid);
            }
            else if (role === UserRole_1.UserRole.Pharmacy) {
                fallbackQuery = fallbackQuery.where('pharmacyId', '==', uid);
            }
            const snapshot = await fallbackQuery.limit(200).get();
            const items = mapDocs(snapshot.docs);
            return items.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
        }
        throw error;
    }
}
async function updatePrescriptionStatus(id, status) {
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
        throw new Error('Invalid prescription status');
    }
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    await admin.firestore().collection(COLLECTION).doc(id).set({ status }, { merge: true });
}
async function getPrescriptionById(id) {
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const doc = await admin.firestore().collection(COLLECTION).doc(id).get();
    if (!doc.exists)
        return null;
    return { ...doc.data(), id: doc.id };
}
//# sourceMappingURL=prescriptionsService.js.map