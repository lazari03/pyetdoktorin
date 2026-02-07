"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable ${name}`);
    }
    return value;
}
exports.env = {
    port: parseInt(process.env.PORT || '4000', 10),
    firebaseServiceAccount: requireEnv('FIREBASE_SERVICE_ACCOUNT'),
    paypalClientId: process.env.PAYPAL_CLIENT_ID ?? '',
    paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET ?? '',
    paypalApiBase: process.env.PAYPAL_API_BASE ?? 'https://api-m.sandbox.paypal.com',
};
//# sourceMappingURL=env.js.map