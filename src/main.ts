import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import settings from './config/settings';
import { ensureLogsDirExists } from './common/logger/fs.util';

async function bootstrap() {
  if (settings.NODE_ENV === 'production') {
    ensureLogsDirExists();
  }

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Progress Path API')
    .setDescription('The Progress Path API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(settings.PORT);
}
void bootstrap();
