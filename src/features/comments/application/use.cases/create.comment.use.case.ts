import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {CommentsRepository} from '../../infrastructure/comments.repository';
import {Comment} from '../../comments.schema';
import {CreateCommentModel} from '../../api/models/dto/create.comment.model';
import {CommentViewModel} from '../../api/models/view/comment.view.model';

export class CreateCommentCommand {
  constructor(public inputModel: CreateCommentModel) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(command: CreateCommentCommand): Promise<CommentViewModel> {
    //todo -1 добавить проверку не забанен ли пользователь в текущем блоге
    const createdComment = Comment.create(command.inputModel);
    return this.commentsRepository.createComment(createdComment);
  }
}
