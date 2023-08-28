import {LikeStatus} from '../../../../infrastructure/utils/constants';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {CommentsRepository} from '../../infrastructure/comments.repository';


export class UpdateCommentLikesCommand {
  constructor(
    public commentId: string,
    public currentUserId: string,
    public likeStatus: LikeStatus,
    ) {}
}

@CommandHandler(UpdateCommentLikesCommand)
export class UpdateCommentLikesUseCase implements ICommandHandler<UpdateCommentLikesCommand> {
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentLikesCommand) {
    return this.commentsRepository.updateCommentLikes(
      command.commentId,
      command.currentUserId,
      command.likeStatus,
    );
  }
}