"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstablishSessionUseCase = void 0;
class EstablishSessionUseCase {
    constructor(sessionService) {
        this.sessionService = sessionService;
    }
    execute(idToken) {
        return this.sessionService.establishSession(idToken);
    }
}
exports.EstablishSessionUseCase = EstablishSessionUseCase;
//# sourceMappingURL=EstablishSessionUseCase.js.map