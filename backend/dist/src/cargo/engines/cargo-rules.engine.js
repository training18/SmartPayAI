"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CargoRulesEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CargoRulesEngine = void 0;
const common_1 = require("@nestjs/common");
let CargoRulesEngine = CargoRulesEngine_1 = class CargoRulesEngine {
    logger = new common_1.Logger(CargoRulesEngine_1.name);
    constraints = {
        yurtici: {
            maxWeight: 100.0,
            maxDesi: 100.0,
            restrictedCities: [],
        },
        aras: {
            maxWeight: 70.0,
            maxDesi: 70.0,
            restrictedCities: ['hakkari', 'sirnak'],
        },
        mng: {
            maxWeight: 50.0,
            maxDesi: 50.0,
            restrictedCities: ['ardahan', 'artvin'],
        },
    };
    evaluate(input) {
        const providerLimit = this.constraints[input.providerCode.toLowerCase()];
        if (!providerLimit) {
            return { isEligible: true };
        }
        if (input.weight > providerLimit.maxWeight) {
            return {
                isEligible: false,
                reason: `Package weight (${input.weight} kg) exceeds provider maximum allowed weight (${providerLimit.maxWeight} kg).`,
            };
        }
        if (input.desi > providerLimit.maxDesi) {
            return {
                isEligible: false,
                reason: `Package volume (${input.desi} desi) exceeds provider maximum allowed dimensional weight (${providerLimit.maxDesi} desi).`,
            };
        }
        const rCityClean = input.receiverCity.trim().toLowerCase();
        if (providerLimit.restrictedCities.includes(rCityClean)) {
            return {
                isEligible: false,
                reason: `Provider does not offer shipping services to ${input.receiverCity}.`,
            };
        }
        return { isEligible: true };
    }
};
exports.CargoRulesEngine = CargoRulesEngine;
exports.CargoRulesEngine = CargoRulesEngine = CargoRulesEngine_1 = __decorate([
    (0, common_1.Injectable)()
], CargoRulesEngine);
//# sourceMappingURL=cargo-rules.engine.js.map