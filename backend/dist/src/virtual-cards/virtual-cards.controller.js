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
exports.VirtualCardsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const virtual_cards_service_1 = require("./virtual-cards.service");
const decorators_1 = require("../common/decorators");
const types_1 = require("../common/types");
let VirtualCardsController = class VirtualCardsController {
    virtualCards;
    constructor(virtualCards) {
        this.virtualCards = virtualCards;
    }
    getMyCard(user) {
        return this.virtualCards.getByUserId(user.sub);
    }
};
exports.VirtualCardsController = VirtualCardsController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user virtual card' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], VirtualCardsController.prototype, "getMyCard", null);
exports.VirtualCardsController = VirtualCardsController = __decorate([
    (0, swagger_1.ApiTags)('Virtual Cards'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('virtual-cards'),
    __metadata("design:paramtypes", [virtual_cards_service_1.VirtualCardsService])
], VirtualCardsController);
//# sourceMappingURL=virtual-cards.controller.js.map