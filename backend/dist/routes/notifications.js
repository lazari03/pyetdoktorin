"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const UserRole_1 = require("../domain/entities/UserRole");
const firebaseAdmin_1 = require("../config/firebaseAdmin");
const router = (0, express_1.Router)();
router.get('/role', (0, auth_1.requireAuth)(), async (req, res) => {
    const user = req.user;
    res.json({ role: user.role });
});
router.post('/appointment-details', (0, auth_1.requireAuth)(), async (req, res) => {
    const { ids } = (req.body || {});
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.json({ items: [] });
    }
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const snapshots = await Promise.all(ids.map((id) => admin.firestore().collection('appointments').doc(id).get()));
    const user = req.user;
    const items = snapshots
        .filter((doc) => doc.exists)
        .map((doc) => {
        const data = doc.data() ?? {};
        return {
            id: doc.id,
            patientName: data.patientName ?? null,
            doctorName: data.doctorName ?? null,
            preferredDate: data.preferredDate ?? '',
            notes: data.notes ?? data.note ?? '',
            patientId: data.patientId ?? '',
            doctorId: data.doctorId ?? '',
        };
    })
        .filter((item) => {
        if (user.role === UserRole_1.UserRole.Admin)
            return true;
        return item.patientId === user.uid || item.doctorId === user.uid;
    })
        .map(({ patientId, doctorId, ...rest }) => rest);
    res.json({ items });
});
router.post('/dismiss/:id', (0, auth_1.requireAuth)(), async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    await admin.firestore().collection('appointments').doc(id).set({
        dismissedBy: { [user.uid]: true },
    }, { merge: true });
    res.json({ ok: true });
});
exports.default = router;
//# sourceMappingURL=notifications.js.map