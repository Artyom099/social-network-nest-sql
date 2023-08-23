import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {randomUUID} from 'crypto';
import {jwtConstants} from '../../../infrastructure/utils/settings';
import {UsersRepository} from '../../users/infrastructure/users.repository';
import {TokenPayloadModel} from '../api/models/token.payload.model';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
  ) {}

  //todo - вынести в отдельный use case
  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    const user = await this.usersRepository.getUserByLoginOrEmail(loginOrEmail);
    if (!user) return null;

    const hash = await this.generateHash(password, user.passwordSalt);
    if (user.passwordHash !== hash) {
      return null;
    } else {
      const payload = { userId: user.id, deviceId: randomUUID() };
      return {
        accessToken: await this.jwtService.signAsync(payload, {
          secret: jwtConstants.accessSecret,
          expiresIn: '10s',
        }),
        refreshToken: await this.jwtService.signAsync(payload, {
          secret: jwtConstants.refreshSecret,
          expiresIn: '20s',
        }),
      };
    }
  }

  //todo - вынести в отдельный сервис

  //async createTokens() {}
  async updateJWT(payload: TokenPayloadModel) {
    const newPayload = { userId: payload.userId, deviceId: payload.deviceId };
    return {
      accessToken: await this.jwtService.signAsync(newPayload, {
        secret: jwtConstants.accessSecret,
        expiresIn: '10s',
      }),
      refreshToken: await this.jwtService.signAsync(newPayload, {
        secret: jwtConstants.refreshSecret,
        expiresIn: '20s',
      }),
    };
  }
  async getTokenPayload(token: string): Promise<any | null> {
    try {
      // { userId: '1682507411257', deviceId: '1682507411257', iat: 1682507422, exp: 1682511022 }
      return this.jwtService.decode(token);
    } catch (e) {
      return null;
    }
  }

  //todo - вынести в отдельный сервис
  async generateHash(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }
}
