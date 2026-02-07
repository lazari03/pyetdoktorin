"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const auth_1 = __importDefault(require("@/routes/auth"));
const users_1 = __importDefault(require("@/routes/users"));
const appointments_1 = __importDefault(require("@/routes/appointments"));
const prescriptions_1 = __importDefault(require("@/routes/prescriptions"));
const clinics_1 = __importDefault(require("@/routes/clinics"));
const payments_1 = __importDefault(require("@/routes/payments"));
const stats_1 = __importDefault(require("@/routes/stats"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('combined'));
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/appointments', appointments_1.default);
app.use('/api/prescriptions', prescriptions_1.default);
app.use('/api/clinics', clinics_1.default);
app.use('/api/payments', payments_1.default);
app.use('/api/stats', stats_1.default);
app.use((err, _req, res) => {
    console.error('Unhandled error', err);
    res.status(500).json({ error: 'Internal server error' });
});
app.listen(env_1.env.port, () => {
    console.log(`Backend listening on port ${env_1.env.port}`);
});
//# sourceMappingURL=index.js.map