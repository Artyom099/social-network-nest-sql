import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {UsersRepository} from '../../infrastructure/users.repository';

export class UnbanUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(UnbanUserCommand)
export class UnbanUserUseCase implements ICommandHandler<UnbanUserCommand> {
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: UnbanUserCommand) {
    const user = await this.usersRepository.getUserById(command.userId);
    if (!user) return null;
    
    await this.usersRepository.unbanUser(command.userId);
  }
}
