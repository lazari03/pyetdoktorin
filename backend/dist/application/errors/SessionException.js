"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionException = void 0;
class SessionException extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'SessionException';
    }
}
exports.SessionException = SessionException;
//# sourceMappingURL=SessionException.js.map