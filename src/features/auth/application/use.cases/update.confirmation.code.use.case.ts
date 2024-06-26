import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EmailManager } from "../../../../infrastructure/services/email.manager";
import { UsersRepository } from "../../../users/infrastructure/users.repository";
import { randomUUID } from "crypto";
import { UsersQueryRepository } from "../../../users/infrastructure/users.query.repository";

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
    private usersQueryRepository: UsersQueryRepository
  ) {}

  async execute(
    command: UpdateConfirmationCodeCommand
  ): Promise<string | null> {
    const { email } = command;

    const user = await this.usersQueryRepository.getUserByLoginOrEmail(email);
    if (!user) return null;

    const newCode = randomUUID();
    await this.usersRepository.updateConfirmationCode(user.id, newCode);

    try {
      await this.emailManager.sendEmailConfirmationCode(email, newCode);
    } catch (error) {
      return null;
    }
    return newCode;
  }
}
