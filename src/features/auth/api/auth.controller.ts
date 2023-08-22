import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {AuthService} from '../application/auth.service';
import {DevicesService} from '../../devices/application/devices.service';
import {CookieGuard} from '../../../infrastructure/guards/cookie.guard';
import {BearerAuthGuard} from '../../../infrastructure/guards/bearer-auth.guard';
import {RegisterUserCommand} from '../application/use.cases/register.user.use.case';
import {CommandBus} from '@nestjs/cqrs';
import {CreateUserInputModel} from '../../users/api/models/input/create.user.input.model';
import {ConfirmEmailCommand} from '../application/use.cases/confirm.email.use.case';
import {SendRecoveryCodeCommand} from '../application/use.cases/send.recovery.code.use.case';
import {UpdatePasswordCommand} from '../application/use.cases/update.password.use.case';
import {UsersQueryRepository} from '../../users/infrastructure/users.query.repository';
import {AuthInputModel} from './models/auth.input.model';
import {EmailInputModel} from './models/email.input.model';
import {SetNewPasswordInputModel} from './models/set.new.password.input.model';
import {UsersRepository} from '../../users/infrastructure/users.repository';
import {ResendConfirmationCommand} from '../application/use.cases/resend.confirmation.use.case';
import {CreateDeviceDTO} from '../../devices/api/models/create.device.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private devicesService: DevicesService,
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository,

    private commandBus: CommandBus,
  ) {}

  @Get('me')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyInfo(@Req() req) {
    const user = await this.usersQueryRepository.getUserById(req.userId);
    return {
      email: user?.email,
      login: user?.login,
      userId: user?.id,
    };
  }

  @Post('login')
  // @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req,
    @Res({ passthrough: true }) res,
    @Body() InputModel: AuthInputModel,
  ) {
    const token = await this.authService.checkCredentials(
      InputModel.loginOrEmail,
      InputModel.password,
    );
    if (!token) throw new UnauthorizedException();

    const user = await this.usersRepository.getUserByLoginOrEmail(InputModel.loginOrEmail);
    if (user?.banInfo.isBanned) {
      throw new UnauthorizedException();
    } else {
      const payload = await this.authService.getTokenPayload(token.refreshToken);
      const createDeviceDTO: CreateDeviceDTO = {
        ip: req.ip,
        title: req.headers['host'],
        lastActiveDate: new Date(payload.iat * 1000),
        deviceId: payload.deviceId,
        userId: payload.userId,
      }
      await this.devicesService.createSession(createDeviceDTO);
      res.cookie('refreshToken', token.refreshToken, { httpOnly: true, secure: true });
      return { accessToken: token.accessToken };
    }
  }

  @Post('refresh-token')
  @UseGuards(CookieGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req, @Res({ passthrough: true }) res) {
    const payload = await this.authService.getTokenPayload(req.cookies.refreshToken);
    const token = await this.authService.updateJWT(
      payload.userId,
      payload.deviceId,
    );
    const newPayload = await this.authService.getTokenPayload(token.refreshToken);
    const lastActiveDate = new Date(newPayload.iat * 1000);
    await this.devicesService.updateLastActiveDate(
      payload.deviceId,
      lastActiveDate,
    );

    res.cookie('refreshToken', token.refreshToken, { httpOnly: true, secure: true });
    return { accessToken: token.accessToken };
  }

  @Post('logout')
  @UseGuards(CookieGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req) {
    const payload = await this.authService.getTokenPayload(req.cookies.refreshToken);
    return this.devicesService.deleteCurrentSession(payload.deviceId);
  }

  @Post('new-password')
  // @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async setNewPassword(@Body() InputModel: SetNewPasswordInputModel) {
    const isUserConfirm =
      await this.usersRepository.getUserByRecoveryCode(InputModel.recoveryCode);
    if (!isUserConfirm) {
      throw new BadRequestException();
    } else {
      return this.commandBus.execute(
        new UpdatePasswordCommand(
          InputModel.recoveryCode,
          InputModel.newPassword,
        ),
      );
    }
  }

  @Post('password-recovery')
  // @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  //todo -> для моих тестов статус OK, по документации NO_CONTENT
  async passwordRecovery(@Body() InputModel: EmailInputModel) {
    return {
      recoveryCode: await this.commandBus.execute(new SendRecoveryCodeCommand(InputModel.email))
    };
  }

  @Post('registration')
  // @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() inputModel: CreateUserInputModel) {
    const emailExist = await this.usersRepository.getUserByLoginOrEmail(inputModel.email);
    if (emailExist) throw new BadRequestException('email exist=>email');

    const loginExist = await this.usersRepository.getUserByLoginOrEmail(inputModel.login);
    if (loginExist) {
      throw new BadRequestException('login exist=>login');
    } else {
      return this.commandBus.execute(new RegisterUserCommand(inputModel));
    }
  }

  @Post('registration-confirmation')
  // @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async sendConfirmationEmail(@Body() body: { code: string }) {
    const confirmEmail = await this.commandBus.execute(new ConfirmEmailCommand(body.code));
    if (!confirmEmail) {
      throw new BadRequestException('code is incorrect, expired or already applied=>code');
    } else {
      return true;
    }
  }

  @Post('registration-email-resending')
  // @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendConfirmationEmail(@Body() body: { email: string }) {
    const user = await this.usersRepository.getUserByLoginOrEmail(body.email);
    if (!user || user.isConfirmed) {
      throw new BadRequestException('email not exist or confirm=>email');
    } else {
      return this.commandBus.execute(new ResendConfirmationCommand(body.email));
    }
  }
}
