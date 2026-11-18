import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const logger = new Logger("VirexApiBootstrap");
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend applications (portal, capital, holding, structure-builder)
  app.enableCors({
    origin: [
      "http://localhost:3200",
      "http://localhost:3202",
      "http://localhost:3203",
      "http://localhost:3204",
      "http://localhost:3103",
      "http://localhost:3100",
      "http://localhost:3102",
      "http://localhost:3009",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3004",
      "https://portal.virex.group",
      "https://virex.group",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-qorve-user-id", "x-user-email"],
  });

  // Global API routing prefix
  app.setGlobalPrefix("api");

  // Global Pipes & Interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    })
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT || 3201;
  await app.listen(port);
  logger.log(`🚀 Virex NestJS API is listening on port ${port} (http://localhost:${port}/api)`);
}

bootstrap();
