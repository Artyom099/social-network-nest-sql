import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {appSettings} from './infrastructure/settings/app.settings';

const postgres = require('postgres');
require('dotenv').config();
const URL = process.env.PG_REMOTE_URL;
const sql = postgres(URL, { ssl: 'require' });


const PORT = process.env.PORT || 3000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appSettings(app);
  await app.listen(PORT);

  async function getPgVersion() {
    const result = await sql`select version()`;
    console.log(result);
  }
  getPgVersion();
}
bootstrap();
