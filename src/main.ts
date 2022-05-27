import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { logger } from '@mikro-orm/nestjs';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  await app.listen(3000);
  logger.log(`Application is running on: ${await app.getUrl()}`);
};

void bootstrap();
