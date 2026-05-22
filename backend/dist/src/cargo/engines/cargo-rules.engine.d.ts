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
export declare class CargoRulesEngine {
    private readonly logger;
    private readonly constraints;
    evaluate(input: RuleEvaluationInput): RuleEvaluationResult;
}
