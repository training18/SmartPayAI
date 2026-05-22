import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

/**
 * Low-level Gemini AI client wrapper.
 *
 * Provides a single `generateJson` method that sends a prompt and parses
 * the response as JSON. Handles retries, error logging, and cleanup.
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly model: GenerativeModel;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.getOrThrow<string>('GEMINI_API_KEY');
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
    this.logger.log('AiService initialized successfully with Gemini API Key.');
  }

  /**
   * Send a system + user prompt to Gemini and parse the response as JSON.
   *
   * @param systemPrompt - System-level instructions
   * @param userPrompt - User-level context
   * @param retries - Number of retries on failure (default: 2)
   */
  async generateJson<T = Record<string, unknown>>(
    systemPrompt: string,
    userPrompt: string,
    retries = 2,
  ): Promise<T> {
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

        // Parse JSON — handle potential markdown code fences
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleaned) as T;
      } catch (error) {
        const errMessage = error instanceof Error ? error.message : String(error);
       
        this.logger.warn(
          `AI generation failed (attempt ${attempt + 1}/${retries + 1}): ${errMessage}`,
        );

        // Exponential backoff for transient errors
        const backoffMs = 1000 * Math.pow(2, attempt);
        this.logger.log(`Transient error encountered. Retrying in ${backoffMs}ms...`);
        await new Promise((r) => setTimeout(r, backoffMs));
      }
    }

    throw new Error('AI generation failed after all retries');
  }
}
