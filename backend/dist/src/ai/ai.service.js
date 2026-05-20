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
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
let AiService = AiService_1 = class AiService {
    config;
    logger = new common_1.Logger(AiService_1.name);
    model;
    constructor(config) {
        this.config = config;
        const apiKey = this.config.getOrThrow('GEMINI_API_KEY');
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        this.logger.log('AiService initialized successfully with Gemini API Key.');
    }
    async generateJson(systemPrompt, userPrompt, retries = 2) {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const result = await this.model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                    systemInstruction: { role: 'model', parts: [{ text: systemPrompt }] },
                    generationConfig: {
                        responseMimeType: 'application/json',
                        temperature: 0.3,
                    },
                });
                const text = result.response.text();
                this.logger.debug(`AI response (attempt ${attempt + 1}): ${text.slice(0, 200)}...`);
                const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                return JSON.parse(cleaned);
            }
            catch (error) {
                const errMessage = error instanceof Error ? error.message : String(error);
                this.logger.warn(`AI generation failed (attempt ${attempt + 1}/${retries + 1}): ${errMessage}`);
                const backoffMs = 1000 * Math.pow(2, attempt);
                this.logger.log(`Transient error encountered. Retrying in ${backoffMs}ms...`);
                await new Promise((r) => setTimeout(r, backoffMs));
            }
        }
        throw new Error('AI generation failed after all retries');
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map