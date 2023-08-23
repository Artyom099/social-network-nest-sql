import {UsersRepository} from '../../../users/infrastructure/users.repository';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {randomUUID} from 'crypto';
import {AuthService} from '../auth.service';

export class CheckCredentialsCommand {
  constructor(
    public loginOrEmail: string,
    public password: string,
  ) {}
}

@CommandHandler(CheckCredentialsCommand)
export class CheckCredentialsUseCase implements ICommandHandler<CheckCredentialsCommand> {
  constructor(
    private authService: AuthService,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: CheckCredentialsCommand) {
    const {loginOrEmail, password} = command
    const user = await this.usersRepository.getUserByLoginOrEmail(loginOrEmail);
    if (!user) return null;

    const hash = await this.authService.generateHash(password, user.passwordSalt);
    if (user.passwordHash !== hash) {
      return null;
    } else {
      const payload = { userId: user.id, deviceId: randomUUID() };
      return this.authService.createTokens(payload)
    }
  }
}