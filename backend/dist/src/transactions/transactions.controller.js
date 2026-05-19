"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const transactions_service_1 = require("./transactions.service");
const dto_1 = require("./dto");
const decorators_1 = require("../common/decorators");
const types_1 = require("../common/types");
let TransactionsController = class TransactionsController {
    transactions;
    constructor(transactions) {
        this.transactions = transactions;
    }
    initiate(user, dto) {
        return this.transactions.initiate(user.sub, dto);
    }
    approve(user, id) {
        return this.transactions.approve(user.sub, id);
    }
    reject(user, id) {
        return this.transactions.reject(user.sub, id);
    }
    findAll(user) {
        return this.transactions.findAllByUser(user.sub);
    }
    findOne(user, id) {
        return this.transactions.findById(user.sub, id);
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Post)('initiate'),
    (0, swagger_1.ApiOperation)({
        summary: 'Initiate a payment — AI analyzes merchant and recommends best card',
    }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.JwtPayload, dto_1.InitiateTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "initiate", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a pending transaction' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.JwtPayload, String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a pending transaction' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.JwtPayload, String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "reject", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all transactions for current user' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction detail with recommendation' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.JwtPayload, String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "findOne", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, swagger_1.ApiTags)('Transactions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map