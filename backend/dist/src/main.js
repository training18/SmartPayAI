"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug'],
    });
    const config = app.get(config_1.ConfigService);
    const port = config.get('PORT', 3000);
    app.use((0, helmet_1.default)());
    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('SmartPayAI Backend')
        .setDescription('AI-powered payment orchestration API. ' +
        'Analyzes merchants, recommends optimal cards, and manages demo payment flows.')
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
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
    });
    await app.listen(port);
    const logger = new common_1.Logger('Bootstrap');
    logger.log(`🚀 SmartPayAI backend running on http://localhost:${port}`);
    logger.log(`📖 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map