import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import session from 'express-session';
import { PassportStatic } from 'passport';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [`http://${process.env.HOSTNAME}:3000`],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.use(
    session({
      secret: new ConfigService().get('JWT_SECRET'),
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(cookieParser());
  const passportInstance: PassportStatic = require('passport');
  app.use(passportInstance.initialize());
  app.use(passportInstance.session());

  passportInstance.serializeUser((user, done) => {
    done(null, user);
  });
  passportInstance.deserializeUser((user, done) => {
    done(null, user);
  });
  await app.listen(3001);
}
bootstrap();
