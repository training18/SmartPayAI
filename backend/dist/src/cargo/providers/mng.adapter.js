"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MngCargoAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MngCargoAdapter = void 0;
const common_1 = require("@nestjs/common");
let MngCargoAdapter = MngCargoAdapter_1 = class MngCargoAdapter {
    logger = new common_1.Logger(MngCargoAdapter_1.name);
    baseRate = 32.0;
    perKgRate = 4.0;
    perDesiRate = 3.5;
    async calculateQuote(input) {
        this.logger.log(`Calculating MNG quote for shipment to ${input.receiverCity}`);
        const billableWeight = Math.max(input.weight, input.desi);
        const price = this.baseRate + billableWeight * Math.max(this.perKgRate, this.perDesiRate);
        const estimatedDeliveryDays = input.receiverCity.toLowerCase() === input.senderCity.toLowerCase() ? 1 : 3;
        return {
            providerCode: 'mng',
            providerName: 'MNG Kargo',
            price: Math.round(price * 100) / 100,
            estimatedDeliveryDays,
        };
    }
};
exports.MngCargoAdapter = MngCargoAdapter;
exports.MngCargoAdapter = MngCargoAdapter = MngCargoAdapter_1 = __decorate([
    (0, common_1.Injectable)()
], MngCargoAdapter);
//# sourceMappingURL=mng.adapter.js.map