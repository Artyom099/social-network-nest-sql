import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {EmailManager} from '../../../../infrastructure/services/email.manager';
import {UsersRepository} from '../../../users/infrastructure/users.repository';
import {randomUUID} from "crypto";

export class SendRecoveryCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(SendRecoveryCodeCommand)
export class SendRecoveryCodeUseCase
  implements ICommandHandler<SendRecoveryCodeCommand>
{
  constructor(
    private emailManager: EmailManager,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: SendRecoveryCodeCommand): Promise<string | null> {
    const user = await this.usersRepository.getUserByLoginOrEmail(command.email);
    const recoveryCode = randomUUID();
    await this.usersRepository.updateRecoveryCode(user.id, recoveryCode);

    try {
      await this.emailManager.sendEmailRecoveryCode(command.email, recoveryCode);
    } catch (e) {
      return null;
    }
    return recoveryCode;
  }
}
