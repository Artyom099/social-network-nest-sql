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
export const bootstrap = async () => {
  try {
    const app = await NestFactory.create(AppModule);
    const configService: ConfigService = app.get(ConfigService)
    console.log(configService.get(''));
    console.log(configService.get('port'));
    console.log(configService.get('PORT'));
    const PORT = parseInt(configService.getOrThrow<string>('PORT'), 10)
    appSettings(app);
    await app.listen(PORT, () => {
      console.log(`App started at ${PORT} port`);
    });
  } catch (e) {
    console.log('cant start', e);
  }

  // await getPgVersion();
}
bootstrap();
