import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EmailManager } from "../../../../infrastructure/services/email.manager";
import { UsersRepository } from "../../../users/infrastructure/users.repository";
import { randomUUID } from "crypto";
import { UsersQueryRepository } from "../../../users/infrastructure/users.query.repository";

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
    private usersQueryRepository: UsersQueryRepository
  ) {}

  async execute(command: SendRecoveryCodeCommand): Promise<string | null> {
    const { email } = command;

    const user = await this.usersQueryRepository.getUserByLoginOrEmail(email);
    const recoveryCode = randomUUID();
    await this.usersRepository.updateRecoveryCode(user.id, recoveryCode);

    try {
      await this.emailManager.sendEmailRecoveryCode(email, recoveryCode);
    } catch (e) {
      return null;
    }
    return recoveryCode;
  }
}
