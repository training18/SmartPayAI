"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ArasCargoAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArasCargoAdapter = void 0;
const common_1 = require("@nestjs/common");
let ArasCargoAdapter = ArasCargoAdapter_1 = class ArasCargoAdapter {
    logger = new common_1.Logger(ArasCargoAdapter_1.name);
    baseRate = 38.0;
    perKgRate = 4.5;
    perDesiRate = 4.0;
    async calculateQuote(input) {
        this.logger.log(`Calculating Aras quote for shipment to ${input.receiverCity}`);
        const billableWeight = Math.max(input.weight, input.desi);
        const price = this.baseRate + billableWeight * Math.max(this.perKgRate, this.perDesiRate);
        const estimatedDeliveryDays = input.receiverCity.toLowerCase() === input.senderCity.toLowerCase() ? 1 : 2;
        return {
            providerCode: 'aras',
            providerName: 'Aras Kargo',
            price: Math.round(price * 100) / 100,
            estimatedDeliveryDays,
        };
    }
};
exports.ArasCargoAdapter = ArasCargoAdapter;
exports.ArasCargoAdapter = ArasCargoAdapter = ArasCargoAdapter_1 = __decorate([
    (0, common_1.Injectable)()
], ArasCargoAdapter);
//# sourceMappingURL=aras.adapter.js.map