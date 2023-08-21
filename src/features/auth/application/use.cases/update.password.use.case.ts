import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import {AuthService} from '../auth.service';
import {UsersRepository} from '../../../users/infrastructure/users.repository';

export class UpdatePasswordCommand {
  constructor(public code: string, public password: string) {}
}

@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordUseCase
  implements ICommandHandler<UpdatePasswordCommand>
{
  constructor(
    private authService: AuthService,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: UpdatePasswordCommand) {
    const user = await this.usersRepository.getUserByRecoveryCode(command.code);
    if (!user) return null;

    const salt = await bcrypt.genSalt(10);
    const hash = await this.authService.generateHash(command.password, salt);
    await this.usersRepository.updateSaltAndHash(user.id, salt, hash);
  }
}
