"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedCardsModule = void 0;
const common_1 = require("@nestjs/common");
const saved_cards_controller_1 = require("./saved-cards.controller");
const saved_cards_service_1 = require("./saved-cards.service");
let SavedCardsModule = class SavedCardsModule {
};
exports.SavedCardsModule = SavedCardsModule;
exports.SavedCardsModule = SavedCardsModule = __decorate([
    (0, common_1.Module)({
        controllers: [saved_cards_controller_1.SavedCardsController],
        providers: [saved_cards_service_1.SavedCardsService],
        exports: [saved_cards_service_1.SavedCardsService],
    })
], SavedCardsModule);
//# sourceMappingURL=saved-cards.module.js.map