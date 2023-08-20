import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {EmailManager} from '../../../../infrastructure/services/email.manager';
import {UsersRepository} from '../../../users/infrastructure/users.repository';
import {randomUUID} from "crypto";

export class UpdateConfirmationCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(UpdateConfirmationCodeCommand)
export class UpdateConfirmationCodeUseCase
  implements ICommandHandler<UpdateConfirmationCodeCommand>
{
  constructor(
    private emailManager: EmailManager,
    private usersRepository: UsersRepository,
  ) {}

  async execute(
    command: UpdateConfirmationCodeCommand,
  ): Promise<string | null> {
    const user = await this.usersRepository.getUserByLoginOrEmail(command.email);
    if (!user) return null;
    const newCode = randomUUID();
    await this.usersRepository.updateConfirmationCode(newCode);

    try {
      // убрал await, чтобы работал rateLimitMiddleware (10 секунд)
      await this.emailManager.sendEmailConfirmationMessage(command.email, newCode);
    } catch (error) {
      return null;
    }
    return newCode;
  }
}
