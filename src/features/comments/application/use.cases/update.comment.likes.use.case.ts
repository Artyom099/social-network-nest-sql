import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {CommentsRepository} from '../../infrastructure/comments.repository';


export class UpdateCommentLikesCommand{
  constructor(public commentId: string, public content: string) {}
}

@CommandHandler(UpdateCommentLikesCommand)
export class UpdateCommentLikesUseCase
  implements ICommandHandler<UpdateCommentLikesCommand> {
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentLikesCommand) {
    return this.commentsRepository.updateComment(command.commentId, command.content);
  }
}