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
function parseNumberEnv(name, fallback) {
    const raw = process.env[name];
    if (raw === undefined || raw === '') {
        if (fallback !== undefined)
            return fallback;
        throw new Error(`Missing required environment variable ${name}`);
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
        throw new Error(`Invalid number for environment variable ${name}`);
    }
    return parsed;
}
function parseCsvEnv(name, fallback = []) {
    const raw = process.env[name];
    if (!raw)
        return fallback;
    return raw.split(',').map((value) => value.trim()).filter((value) => value.length > 0);
}
exports.env = {
    port: parseInt(process.env.PORT || '4000', 10),
    firebaseServiceAccount: requireEnv('FIREBASE_SERVICE_ACCOUNT'),
    paddleEnv: process.env.PADDLE_ENV ?? 'sandbox',
    paddleApiKey: process.env.PADDLE_API_KEY ?? '',
    paddleWebhookSecret: process.env.PADDLE_WEBHOOK_SECRET ?? '',
    paywallAmountUsd: parseNumberEnv('PAYWALL_AMOUNT_USD', parseNumberEnv('NEXT_PUBLIC_PAYWALL_AMOUNT_USD', 13)),
    corsOrigins: parseCsvEnv('CORS_ORIGINS', []),
};
//# sourceMappingURL=env.js.map