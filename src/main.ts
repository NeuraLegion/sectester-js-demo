import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { logger } from '@mikro-orm/nestjs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('SecTester JS Demo')
    .setDescription(
      'This is a demo project for the SecTester JS SDK framework, with some installation and usage examples.'
    )
    .setVersion('1.0')
    .addTag('users')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  logger.log(`Application is running on: ${await app.getUrl()}`);
};

void bootstrap();
