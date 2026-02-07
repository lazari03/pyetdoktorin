"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirebaseAdmin = getFirebaseAdmin;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const env_1 = require("./env");
let initialized = false;
function getFirebaseAdmin() {
    if (!initialized) {
        const serviceAccount = JSON.parse(env_1.env.firebaseServiceAccount);
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
        });
        initialized = true;
    }
    return firebase_admin_1.default;
}
//# sourceMappingURL=firebaseAdmin.js.map
