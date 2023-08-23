import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {UsersRepository} from '../../../users/infrastructure/users.repository';

export class ConfirmEmailCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<boolean> {
    const user = await this.usersRepository.getUserByConfirmationCode(command.code);
    if (!user || user.isConfirmed || user.confirmationCode !== command.code || user.expirationDate < new Date().toISOString()) {
      return false;
    } else {
      return this.usersRepository.confirmEmail(user.id);
    }
  }
}
