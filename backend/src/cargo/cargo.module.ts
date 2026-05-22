import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma';
import { AiModule } from '../ai/ai.module';
import { CargoController } from './cargo.controller';
import { CargoService } from './cargo.service';
import { YurticiCargoAdapter } from './providers/yurtici.adapter';
import { MngCargoAdapter } from './providers/mng.adapter';
import { ArasCargoAdapter } from './providers/aras.adapter';
import { CargoRulesEngine } from './engines/cargo-rules.engine';
import { CargoAiOptimizationService } from './engines/cargo-ai-optimization.service';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [CargoController],
  providers: [
    CargoService,
    CargoRulesEngine,
    CargoAiOptimizationService,
    YurticiCargoAdapter,
    MngCargoAdapter,
    ArasCargoAdapter,
  ],
  exports: [CargoService],
})
export class CargoModule {}
