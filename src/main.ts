import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {appSettings} from './infrastructure/settings/app.settings';
import {ConfigService} from '@nestjs/config';
//
// const postgres = require('postgres');
// require('dotenv').config();
// const URL = process.env.PG_REMOTE_URL;
// const sql = postgres(URL, { ssl: 'require' });
//
// async function getPgVersion() {
//   const result = await sql`select version()`;
//   console.log(result);
// }
//
// const PORT = process.env.PORT || 3000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService)
  const PORT = parseInt(configService.getOrThrow('PORT'), 10)
  appSettings(app);
  await app.listen(PORT, () => {
    console.log(`App started at ${PORT} port`);
  });
  // await getPgVersion();
}
bootstrap();
