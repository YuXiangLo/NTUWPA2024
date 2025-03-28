// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe with custom exception handling
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to DTO types
      whitelist: true, // Strip properties that do not have decorators in the DTO
      forbidNonWhitelisted: true, // Throw an error when there are unexpected properties
      exceptionFactory: (validationErrors) => {
        // Format the validation errors as needed
        const errorMessages = validationErrors.map((error) => {
          // Safely handle the case when constraints might be undefined
          const constraints = error.constraints ? Object.values(error.constraints).join(', ') : 'Unknown validation error';
          return `${error.property} has failed the validation: ${constraints}`;
        });

        // Return the validation errors as a BadRequestException
        return new BadRequestException(errorMessages);
      },
    }),
  );

  // Set up Swagger
  const config = new DocumentBuilder()
    .setTitle('User Registration API')
    .setDescription('API for user registration and management')
    .setVersion('1.0')
    .addTag('users')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  
}
bootstrap();
