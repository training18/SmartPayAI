import { ConfigService } from '@nestjs/config';
export declare class AiService {
    private readonly config;
    private readonly logger;
    private readonly model;
    constructor(config: ConfigService);
    generateJson<T = Record<string, unknown>>(systemPrompt: string, userPrompt: string, retries?: number): Promise<T>;
}
