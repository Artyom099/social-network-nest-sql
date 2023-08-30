import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {BanUserCurrentBlogInputModel} from '../../api/models/input/ban.user.current.blog.input.model';
import {BannedUsersForBlogRepository} from '../../infrastructure/banned.users.for.blog.repository';
import {BannedUsersForBlogQueryRepository} from '../../infrastructure/banned.users.for.blog.query.repository';
import {UsersQueryRepository} from '../../infrastructure/users.query.repository';

export class BanUserForCurrentBlogCommand {
  constructor(
    public userId: string,
    public inputModel: BanUserCurrentBlogInputModel,
  ) {}
}

@CommandHandler(BanUserForCurrentBlogCommand)
export class BanUserForCurrentBlogUseCase
  implements ICommandHandler<BanUserForCurrentBlogCommand>
{
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private bannedUsersForBlogRepository: BannedUsersForBlogRepository,
    private bannedUsersForBlogQueryRepository: BannedUsersForBlogQueryRepository,
  ) {}

  async execute(command: BanUserForCurrentBlogCommand) {
    const { userId, inputModel } = command;
    const user = await this.usersQueryRepository.getUserById(userId);
    if (!user) return null;

    const bannedUser =
      await this.bannedUsersForBlogQueryRepository.getBannedUserForBlog(
        userId,
        inputModel.blogId,
      );
    if (!bannedUser && inputModel.isBanned) {
      return this.bannedUsersForBlogRepository.banUserForBlog(
        userId,
        user.login,
        user.createdAt,
        inputModel,
      );
    }
    if (bannedUser && !inputModel.isBanned) {
      return this.bannedUsersForBlogRepository.unbanUserForBlog(userId);
    }
    return;
  }
}
