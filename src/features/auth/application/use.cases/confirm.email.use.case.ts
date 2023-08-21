import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {UsersRepository} from '../../../users/infrastructure/users.repository';

export class ConfirmEmailCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<boolean> {
    const user = await this.usersRepository.getUserByConfirmationCode(command.code);
    console.log(user.isConfirmed )
    if (user.isConfirmed && user.confirmationCode === command.code && user.expirationDate > new Date()) {
      return false;
    } else {
      await this.usersRepository.confirmEmail(user.id);
      return true;
    }
  }
}
