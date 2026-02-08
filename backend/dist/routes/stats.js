"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const UserRole_1 = require("../domain/entities/UserRole");
const firebaseAdmin_1 = require("../config/firebaseAdmin");
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
const DEFAULT_APPOINTMENT_PRICE = env_1.env.paywallAmountUsd;
router.get('/admin', (0, auth_1.requireAuth)([UserRole_1.UserRole.Admin]), async (_req, res) => {
    try {
        const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
        const db = admin.firestore();
        const [appointmentsSnap, prescriptionsSnap, clinicsSnap, usersSnap] = await Promise.all([
            db.collection('appointments').get(),
            db.collection('recipe').get(),
            db.collection('clinicBookings').get(),
            db.collection('users').get(),
        ]);
        const totalAppointments = appointmentsSnap.size;
        const totalRecipes = prescriptionsSnap.size;
        const totalClinicBookings = clinicsSnap.size;
        const totalUsers = usersSnap.size;
        const now = new Date();
        const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
        const monthlyRevenue = appointmentsSnap.docs.reduce((sum, doc) => {
            const data = doc.data();
            if (!data.isPaid || !data.preferredDate)
                return sum;
            const date = new Date(data.preferredDate);
            if (date >= monthStart && date < nextMonthStart) {
                return sum + DEFAULT_APPOINTMENT_PRICE;
            }
            return sum;
        }, 0);
        res.json({
            totalAppointments,
            totalRecipes,
            totalClinicBookings,
            totalUsers,
            monthlyRevenue,
        });
    }
    catch (error) {
        console.error('Failed to load admin stats', error);
        res.status(500).json({ error: 'Failed to load stats' });
    }
});
exports.default = router;
//# sourceMappingURL=stats.js.map