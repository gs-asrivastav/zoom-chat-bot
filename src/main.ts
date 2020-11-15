import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as DotEnv from 'dotenv';

async function bootstrap() {
  DotEnv.config();
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT);
}

bootstrap();
