import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

(async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { abortOnError: false },
  );
  const cs = app.get(ConfigService);
  const port = cs.get('SERVER_PORT');
  const address = cs.get('SERVER_ADDRESS');
  const isDevelopment = cs.get('NODE_ENV') === 'development';

  try {
    /**
     * Plugins
     */
    await app.register(helmet, { contentSecurityPolicy: false });
    await app.register(cors);
    /**
     * Rest Documentation
     */
    if (isDevelopment) {
      const config = new DocumentBuilder()
        .setTitle('API REST Docs')
        .setDescription('REST Documentation')
        .setVersion('1.0')
        .addTag('REST')
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('documentation', app, document);
    }
    /**
     * Start API
     */
    await app.listen(port, address);
    logger.verbose(`API running on: ${await app.getUrl()}`);
  } catch (err) {
    logger.verbose(err);
  }
})();
