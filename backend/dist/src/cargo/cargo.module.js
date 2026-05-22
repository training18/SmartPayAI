"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CargoModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
const ai_module_1 = require("../ai/ai.module");
const cargo_controller_1 = require("./cargo.controller");
const cargo_service_1 = require("./cargo.service");
const yurtici_adapter_1 = require("./providers/yurtici.adapter");
const mng_adapter_1 = require("./providers/mng.adapter");
const aras_adapter_1 = require("./providers/aras.adapter");
const cargo_rules_engine_1 = require("./engines/cargo-rules.engine");
const cargo_ai_optimization_service_1 = require("./engines/cargo-ai-optimization.service");
let CargoModule = class CargoModule {
};
exports.CargoModule = CargoModule;
exports.CargoModule = CargoModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule, ai_module_1.AiModule],
        controllers: [cargo_controller_1.CargoController],
        providers: [
            cargo_service_1.CargoService,
            cargo_rules_engine_1.CargoRulesEngine,
            cargo_ai_optimization_service_1.CargoAiOptimizationService,
            yurtici_adapter_1.YurticiCargoAdapter,
            mng_adapter_1.MngCargoAdapter,
            aras_adapter_1.ArasCargoAdapter,
        ],
        exports: [cargo_service_1.CargoService],
    })
], CargoModule);
//# sourceMappingURL=cargo.module.js.map