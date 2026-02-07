"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const UserRole_1 = require("@/domain/entities/UserRole");
const firebaseAdmin_1 = require("@/config/firebaseAdmin");
const router = (0, express_1.Router)();
router.get('/', (0, auth_1.requireAuth)([UserRole_1.UserRole.Admin, UserRole_1.UserRole.Doctor, UserRole_1.UserRole.Pharmacy]), async (req, res) => {
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const { page: rawPage = '0', pageSize: rawPageSize = '20', search: rawSearch = '', role: rawRole } = req.query;
    const page = Math.max(0, parseInt(rawPage, 10) || 0);
    const pageSize = Math.min(100, Math.max(1, parseInt(rawPageSize, 10) || 20));
    const search = (rawSearch || '').trim().toLowerCase();
    const roleFilter = typeof rawRole === 'string' && rawRole.trim().length > 0 ? rawRole.toLowerCase() : undefined;
    const actorRole = req.user?.role;
    if (!actorRole) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (actorRole !== UserRole_1.UserRole.Admin) {
        if (!roleFilter) {
            return res.status(403).json({ error: 'Role filter required' });
        }
        const allowedRoles = actorRole === UserRole_1.UserRole.Doctor ? [UserRole_1.UserRole.Patient, UserRole_1.UserRole.Pharmacy] : [UserRole_1.UserRole.Patient];
        if (!allowedRoles.includes(roleFilter)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
    }
    const snapshot = await admin.firestore().collection('users').get();
    let users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    if (roleFilter) {
        users = users.filter((user) => String(user.role || '').toLowerCase() === roleFilter);
    }
    if (search) {
        users = users.filter((user) => {
            const haystack = `${user.name ?? ''} ${user.surname ?? ''} ${user.email ?? ''} ${user.role ?? ''}`.toLowerCase();
            return haystack.includes(search);
        });
    }
    if (actorRole !== UserRole_1.UserRole.Admin) {
        users = users.map((user) => ({
            id: user.id,
            role: user.role,
            name: user.name,
            surname: user.surname,
            email: user.email,
            phone: user.phone,
            pharmacyName: user.pharmacyName,
        }));
    }
    const total = users.length;
    const start = page * pageSize;
    const items = users.slice(start, start + pageSize);
    res.json({ items, total, page, pageSize });
});
router.get('/:id', (0, auth_1.requireAuth)([UserRole_1.UserRole.Admin]), async (req, res) => {
    const { id } = req.params;
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const doc = await admin.firestore().collection('users').doc(id).get();
    if (!doc.exists) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
});
router.post('/', (0, auth_1.requireAuth)([UserRole_1.UserRole.Admin]), async (req, res) => {
    const { name, surname, email, password, role = UserRole_1.UserRole.Patient, phone } = req.body || {};
    if (!name || !surname || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const normalizedRole = Object.values(UserRole_1.UserRole).includes(role) ? role : UserRole_1.UserRole.Patient;
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const displayName = `${name} ${surname}`.trim();
    const phoneNumber = typeof phone === 'string' && phone.trim().length > 0 ? phone.trim() : undefined;
    const createRequest = {
        email,
        password,
        displayName,
    };
    if (phoneNumber) {
        createRequest.phoneNumber = phoneNumber;
    }
    const userRecord = await admin.auth().createUser(createRequest);
    await admin.auth().setCustomUserClaims(userRecord.uid, {
        role: normalizedRole,
        admin: normalizedRole === UserRole_1.UserRole.Admin,
    });
    await admin.firestore().collection('users').doc(userRecord.uid).set({
        name,
        surname,
        role: normalizedRole,
        email,
        phone: phoneNumber ?? null,
        createdBy: 'admin',
        createdAt: Date.now(),
        updatedAt: Date.now(),
    }, { merge: true });
    res.status(201).json({ id: userRecord.uid, role: normalizedRole });
});
router.patch('/:id', (0, auth_1.requireAuth)([UserRole_1.UserRole.Admin]), async (req, res) => {
    const { id } = req.params;
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const body = (req.body ?? {});
    const updates = {};
    const updatableFields = ['name', 'surname', 'email', 'role', 'patientNotes', 'allergies', 'chronicConditions', 'phone', 'bio', 'specialization', 'specializations', 'approvalStatus'];
    updatableFields.forEach((field) => {
        const value = body[field];
        if (value !== undefined) {
            updates[field] = value;
        }
    });
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }
    if (updates.role && !Object.values(UserRole_1.UserRole).includes(updates.role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }
    await admin.firestore().collection('users').doc(id).set(updates, { merge: true });
    if (updates.role) {
        const updatedRole = updates.role;
        await admin.auth().setCustomUserClaims(id, {
            role: updatedRole,
            admin: updatedRole === UserRole_1.UserRole.Admin,
        });
    }
    res.json({ ok: true });
});
router.delete('/:id', (0, auth_1.requireAuth)([UserRole_1.UserRole.Admin]), async (req, res) => {
    const { id } = req.params;
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    await admin.auth().deleteUser(id);
    await admin.firestore().collection('users').doc(id).delete();
    res.json({ ok: true });
});
router.post('/:id/reset-password', (0, auth_1.requireAuth)([UserRole_1.UserRole.Admin]), async (req, res) => {
    const { id } = req.params;
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const userRecord = await admin.auth().getUser(id);
    if (!userRecord.email) {
        return res.status(400).json({ error: 'User has no email' });
    }
    const link = await admin.auth().generatePasswordResetLink(userRecord.email);
    res.json({ resetLink: link });
});
exports.default = router;
//# sourceMappingURL=users.js.map