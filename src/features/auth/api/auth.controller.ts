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
} from "@nestjs/common";
import { TokensService } from "../../../infrastructure/services/tokens.service";
import { DevicesService } from "../../devices/application/devices.service";
import { CookieGuard } from "../../../infrastructure/guards/cookie.guard";
import { BearerAuthGuard } from "../../../infrastructure/guards/bearer-auth.guard";
import { RegisterUserCommand } from "../application/use.cases/register.user.use.case";
import { CommandBus } from "@nestjs/cqrs";
import { CreateUserInputModel } from "../../users/api/models/input/create.user.input.model";
import { ConfirmEmailCommand } from "../application/use.cases/confirm.email.use.case";
import { SendRecoveryCodeCommand } from "../application/use.cases/send.recovery.code.use.case";
import { UpdatePasswordCommand } from "../application/use.cases/update.password.use.case";
import { UsersQueryRepository } from "../../users/infrastructure/users.query.repository";
import { AuthInputModel } from "./models/input/auth.input.model";
import { EmailInputModel } from "./models/input/email.input.model";
import { SetNewPasswordInputModel } from "./models/input/set.new.password.input.model";
import { ResendConfirmationCommand } from "../application/use.cases/resend.confirmation.use.case";
import { CreateDeviceDTO } from "../../devices/api/models/create.device.dto";
import { CheckCredentialsCommand } from "../application/use.cases/check.credentials.use.case";
import { RefreshTokenCommand } from "../application/use.cases/refresh.token.use.case";
import { CookieOptions } from "express";
import { CodeInputModel } from "./models/code.input.model";

@Controller("auth")
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private tokensService: TokensService,
    private devicesService: DevicesService,
    private usersQueryRepository: UsersQueryRepository
  ) {}

  @Get("me")
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyInfo(@Req() req: any) {
    const user = await this.usersQueryRepository.getUserById(req.userId);

    return {
      email: user?.email,
      login: user?.login,
      userId: user?.id,
    };
  }

  @Post("login")
  // @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
    @Body() body: AuthInputModel
  ) {
    const { loginOrEmail, password } = body;

    const token = await this.commandBus.execute(
      new CheckCredentialsCommand(loginOrEmail, password)
    );
    if (!token) throw new UnauthorizedException();

    //todo - move to IsUserBannedUseCase??
    const user = await this.usersQueryRepository.getUserByLoginOrEmail(
      loginOrEmail
    );
    if (user?.banInfo.isBanned) throw new UnauthorizedException();

    const payload = await this.tokensService.getTokenPayload(
      token.refreshToken
    );

    const dto: CreateDeviceDTO = {
      ip: req.ip,
      title: req.headers.host,
      lastActiveDate: new Date(payload.iat * 1000),
      deviceId: payload.deviceId,
      userId: payload.userId,
    };
    await this.devicesService.createDevise(dto);

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
    };

    res.cookie("refreshToken", token.refreshToken, cookieOptions);

    return { accessToken: token.accessToken };
  }

  @Post("refresh-token")
  @UseGuards(CookieGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const { deviceId, lastActiveDate, token } = await this.commandBus.execute(
      new RefreshTokenCommand(req.cookies.refreshToken)
    );

    await this.devicesService.updateLastActiveDate(deviceId, lastActiveDate);

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
    };

    res.cookie("refreshToken", token.refreshToken, cookieOptions);

    return { accessToken: token.accessToken };
  }

  @Post("logout")
  @UseGuards(CookieGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: any) {
    const payload = await this.tokensService.getTokenPayload(
      req.cookies.refreshToken
    );

    return this.devicesService.deleteCurrentDevice(payload.deviceId);
  }

  @Post("new-password")
  // @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async setNewPassword(@Body() body: SetNewPasswordInputModel) {
    const { recoveryCode, newPassword } = body;

    const isUserConfirm = await this.usersQueryRepository.getUserByRecoveryCode(
      recoveryCode
    );
    if (!isUserConfirm) throw new BadRequestException();

    return this.commandBus.execute(
      new UpdatePasswordCommand(recoveryCode, newPassword)
    );
  }

  @Post("password-recovery")
  // @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  //todo -> для моих тестов статус OK, по документации NO_CONTENT
  async passwordRecovery(@Body() body: EmailInputModel) {
    return {
      recoveryCode: await this.commandBus.execute(
        new SendRecoveryCodeCommand(body.email)
      ),
    };
  }

  @Post("registration")
  // @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: CreateUserInputModel) {
    const { login, email } = body;

    const emailExist = await this.usersQueryRepository.getUserByLoginOrEmail(
      email
    );
    if (emailExist) throw new BadRequestException("email exist=>email");

    const loginExist = await this.usersQueryRepository.getUserByLoginOrEmail(
      login
    );
    if (loginExist) throw new BadRequestException("login exist=>login");

    return this.commandBus.execute(new RegisterUserCommand(body));
  }

  @Post("registration-confirmation")
  // @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  //todo - add validation to code
  async sendConfirmationEmail(@Body() body: CodeInputModel) {
    const confirmEmail = await this.commandBus.execute(
      new ConfirmEmailCommand(body.code)
    );

    if (!confirmEmail)
      throw new BadRequestException(
        "code is incorrect, expired or applied=>code"
      );

    return true;
  }

  @Post("registration-email-resending")
  // @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendConfirmationEmail(@Body() body: { email: string }) {
    const user = await this.usersQueryRepository.getUserByLoginOrEmail(
      body.email
    );

    if (!user || user.isConfirmed) {
      throw new BadRequestException("email not exist or confirm=>email");
    } else {
      return this.commandBus.execute(
        new ResendConfirmationCommand(body.email, user.id)
      );
    }
  }
}
