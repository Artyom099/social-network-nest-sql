import {Injectable} from '@nestjs/common';
import {TypeOrmModuleOptions, TypeOrmOptionsFactory} from '@nestjs/typeorm';
import {ConfigService} from '@nestjs/config';


@Injectable()
export class TypeOrmOptions implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {
  }

  createTypeOrmOptions():  TypeOrmModuleOptions {
    const nodeEnv = this.configService.getOrThrow<string>('NODE_ENV')
    if  (nodeEnv && nodeEnv.toUpperCase() === 'DEVELOPMENT') {
      return this.getLocalDb()
    } else {
      return this.getRemoteDb();
    }
  }

  private getLocalDb(): TypeOrmModuleOptions{
    return {
      type: 'postgres',
      host: '127.0.0.1',
      port: 4000,
      username: 'postgres',
      password: 'vgy78uhb',
      database: 'postgres',
      autoLoadEntities: true,
      synchronize: true,
    }
  }

  private getRemoteDb(): TypeOrmModuleOptions{
    return {
      type: 'postgres',
      url: this.configService.get("PG_REMOTE_URL"),
      autoLoadEntities: true,
      synchronize: true,
      ssl: true,
    }
  }

}