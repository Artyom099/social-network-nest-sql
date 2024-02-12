import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import cookieParser from "cookie-parser";
import { useContainer } from "class-validator";
import { AppModule } from "../../app.module";
import { HttpExceptionFilter } from "../exception-filters/exception.filter";

export const appSettings = <T>(app: INestApplication, module: T) => {
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      // forbidUnknownValues: false,

      // в exceptionFactory передаем массив ошибок errors
      exceptionFactory: (errors) => {
        const errorsForResponse: any = [];

        errors.forEach((err) => {
          // достаем ключи из объектов constraints каждого элемента массива
          const keys = Object.keys(err.constraints || {});

          // пробегаемся по ключам и добавляем каждую ошибку в нужном нам виде в массив errorsForResponse
          keys.forEach((key) => {
            if (err.constraints) {
              errorsForResponse.push({
                message: err.constraints[key],
                field: err.property,
              });
            }
          });
        });

        throw new BadRequestException(errorsForResponse);
      },
    })
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
};
