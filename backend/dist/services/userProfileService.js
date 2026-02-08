"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = getUserProfile;
exports.buildDisplayName = buildDisplayName;
const firebaseAdmin_1 = require("../config/firebaseAdmin");
async function getUserProfile(uid) {
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const doc = await admin.firestore().collection('users').doc(uid).get();
    if (!doc.exists)
        return null;
    return doc.data();
}
function buildDisplayName(profile, fallback) {
    if (!profile)
        return fallback;
    const parts = [profile.name, profile.surname].filter((value) => Boolean(value));
    const combined = parts.join(' ').trim();
    return combined || profile.name || fallback;
}
//# sourceMappingURL=userProfileService.js.map