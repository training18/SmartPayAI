import { Injectable, Logger } from '@nestjs/common';

export interface RuleEvaluationInput {
  providerCode: string;
  weight: number;
  desi: number;
  senderCity: string;
  receiverCity: string;
}

export interface RuleEvaluationResult {
  isEligible: boolean;
  reason?: string;
}

@Injectable()
export class CargoRulesEngine {
  private readonly logger = new Logger(CargoRulesEngine.name);

  // Hardcoded rules for cargo providers to model deterministic capability limits
  private readonly constraints: Record<string, { maxWeight: number; maxDesi: number; restrictedCities: string[] }> = {
    yurtici: {
      maxWeight: 100.0,
      maxDesi: 100.0,
      restrictedCities: [], // Yurtici ships everywhere
    },
    aras: {
      maxWeight: 70.0,
      maxDesi: 70.0,
      restrictedCities: ['hakkari', 'sirnak'], // Example rural regions not serviced by Aras express
    },
    mng: {
      maxWeight: 50.0,
      maxDesi: 50.0,
      restrictedCities: ['ardahan', 'artvin'], // Example restricted service locations
    },
  };

  /**
   * Evaluates if a provider is eligible for a shipment based on physical and regional rules.
   */
  evaluate(input: RuleEvaluationInput): RuleEvaluationResult {
    const providerLimit = this.constraints[input.providerCode.toLowerCase()];
    if (!providerLimit) {
      // By default, if no limits mapped, it's eligible
      return { isEligible: true };
    }

    // Rule 1: Max Weight check
    if (input.weight > providerLimit.maxWeight) {
      return {
        isEligible: false,
        reason: `Package weight (${input.weight} kg) exceeds provider maximum allowed weight (${providerLimit.maxWeight} kg).`,
      };
    }

    // Rule 2: Max Desi check
    if (input.desi > providerLimit.maxDesi) {
      return {
        isEligible: false,
        reason: `Package volume (${input.desi} desi) exceeds provider maximum allowed dimensional weight (${providerLimit.maxDesi} desi).`,
      };
    }

    // Rule 3: Regional restrictions check
    const rCityClean = input.receiverCity.trim().toLowerCase();
    if (providerLimit.restrictedCities.includes(rCityClean)) {
      return {
        isEligible: false,
        reason: `Provider does not offer shipping services to ${input.receiverCity}.`,
      };
    }

    return { isEligible: true };
  }
}
