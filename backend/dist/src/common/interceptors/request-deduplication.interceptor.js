"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestDeduplicationInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let RequestDeduplicationInterceptor = class RequestDeduplicationInterceptor {
    logger = new common_1.Logger('Deduplication');
    activeRequests = new Set();
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, user, body } = request;
        if (method !== 'POST' || !url.includes('/transactions/initiate')) {
            return next.handle();
        }
        const userId = user?.sub || user?.id || 'anonymous';
        const amount = body?.amount ?? '';
        const merchantName = body?.merchantName ?? '';
        const requestKey = `${userId}:${method}:${url}:${merchantName}:${amount}`;
        if (this.activeRequests.has(requestKey)) {
            this.logger.warn(`Duplicate request blocked for user ${userId}: ${requestKey}`);
            throw new common_1.ConflictException('Bu işlem zaten gerçekleştiriliyor. Lütfen bekleyin.');
        }
        this.activeRequests.add(requestKey);
        this.logger.debug(`Registering active request key: ${requestKey}`);
        return next.handle().pipe((0, operators_1.finalize)(() => {
            this.activeRequests.delete(requestKey);
            this.logger.debug(`Cleared request key: ${requestKey}`);
        }));
    }
};
exports.RequestDeduplicationInterceptor = RequestDeduplicationInterceptor;
exports.RequestDeduplicationInterceptor = RequestDeduplicationInterceptor = __decorate([
    (0, common_1.Injectable)()
], RequestDeduplicationInterceptor);
//# sourceMappingURL=request-deduplication.interceptor.js.map