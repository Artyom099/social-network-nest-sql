import {LikeStatus} from '../../../../infrastructure/utils/constants';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {CommentsRepository} from '../../infrastructure/comments.repository';
import {UpdateCommentLikeModel} from '../../api/models/dto/update.comment.like.model';

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
    const model: UpdateCommentLikeModel  = {
      commentId: command.commentId,
      userId: command.currentUserId,
      likeStatus: command.likeStatus,
    }
    await this.commentsRepository.setCommentNone(model)
    return this.commentsRepository.setCommentReaction(model)
  }
}