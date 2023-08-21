import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {UsersRepository} from "../../../users/infrastructure/users.repository";
import {randomUUID} from "crypto";
import {EmailManager} from "../../../../infrastructure/services/email.manager";

export class ResendConfirmationCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendConfirmationCommand)
export class ResendConfirmationUseCase implements ICommandHandler<ResendConfirmationCommand> {
  constructor(
    private emailManager: EmailManager,
    private usersRepository: UsersRepository
  ) {}

  async execute(command: ResendConfirmationCommand) {
    const user = await this.usersRepository.getUserByLoginOrEmail(command.email);
    const newCode = randomUUID()
    await this.usersRepository.updateConfirmationCode(user.id, newCode)

    try {
      await this.emailManager.sendEmailConfirmationCode(command.email, newCode)
    } catch (e) {
      return null;
    }
    return newCode
  }
}