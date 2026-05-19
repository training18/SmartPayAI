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
exports.SavedCardsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const saved_cards_service_1 = require("./saved-cards.service");
const dto_1 = require("./dto");
const decorators_1 = require("../common/decorators");
const types_1 = require("../common/types");
let SavedCardsController = class SavedCardsController {
    savedCards;
    constructor(savedCards) {
        this.savedCards = savedCards;
    }
    findAll(user) {
        return this.savedCards.findAllByUser(user.sub);
    }
    create(user, dto) {
        return this.savedCards.create(user.sub, dto);
    }
    update(user, id, dto) {
        return this.savedCards.update(user.sub, id, dto);
    }
    remove(user, id) {
        return this.savedCards.remove(user.sub, id);
    }
};
exports.SavedCardsController = SavedCardsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all saved cards for current user' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], SavedCardsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add a new saved card' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.JwtPayload, dto_1.CreateSavedCardDto]),
    __metadata("design:returntype", void 0)
], SavedCardsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a saved card' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.JwtPayload, String, dto_1.UpdateSavedCardDto]),
    __metadata("design:returntype", void 0)
], SavedCardsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a saved card' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.JwtPayload, String]),
    __metadata("design:returntype", void 0)
], SavedCardsController.prototype, "remove", null);
exports.SavedCardsController = SavedCardsController = __decorate([
    (0, swagger_1.ApiTags)('Saved Cards'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('saved-cards'),
    __metadata("design:paramtypes", [saved_cards_service_1.SavedCardsService])
], SavedCardsController);
//# sourceMappingURL=saved-cards.controller.js.map