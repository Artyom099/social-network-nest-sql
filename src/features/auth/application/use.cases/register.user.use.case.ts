import {UsersService} from '../../../users/application/users.service';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {CreateUserInputModel} from '../../../users/api/models/input/create.user.input.model';
import {UserViewModel} from '../../../users/api/models/view/user.view.model';
import {UsersRepository} from '../../../users/infrastructure/users.repository';
import add from "date-fns/add";
import {randomUUID} from "crypto";

export class RegisterUserCommand {
  constructor(public InputModel: CreateUserInputModel) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    private usersService: UsersService,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: RegisterUserCommand): Promise<UserViewModel> {
    const { InputModel } = command;
    const { salt, hash } = await this.usersService.generateSaltAndHash(InputModel.password);

    const createUserDTO = {
      InputModel,
      salt,
      hash,
      expirationDate: add(new Date(), { minutes: 20 }),
      confirmationCode: randomUUID(),
      isConfirmed: false,
    }
    return this.usersRepository.createUserBySelfSql(createUserDTO);
  }
}
