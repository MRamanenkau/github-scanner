import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import corsConfig from './config/cors.config';
import { envSchema } from './config/env.schema';

const env = envSchema.parse(process.env);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(corsConfig);

  await app.listen(env.PORT);
}
bootstrap();
