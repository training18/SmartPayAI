import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

/**
 * Application bootstrap — sets up:
 * - Global validation pipe (class-validator DTOs)
 * - Helmet security headers
 * - CORS for mobile frontend
 * - Swagger API documentation
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3000);

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(helmet());
  app.enableCors({
    origin: '*', // TODO: restrict in production
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Validation ────────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true,           // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── Swagger API Docs ──────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SmartPayAI Backend')
    .setDescription(
      'AI-powered payment orchestration API. ' +
      'Analyzes merchants, recommends optimal cards, and manages demo payment flows.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth', 'User authentication and token management')
    .addTag('Users', 'User profile management')
    .addTag('Virtual Cards', 'Demo virtual card system')
    .addTag('Saved Cards', 'User card management')
    .addTag('Campaigns', 'Bank campaign management')
    .addTag('AI', 'AI merchant intelligence and card recommendation')
    .addTag('Transactions', 'Payment flow and transaction management')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // ── Start ─────────────────────────────────────────────────────────────────
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 SmartPayAI backend running on http://localhost:${port}`);
  logger.log(`📖 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
