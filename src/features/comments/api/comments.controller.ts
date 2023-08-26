import {CommentsService} from '../application/comments.service';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {CommentInputModel} from './models/input/comment.input.model';
import {BearerAuthGuard} from '../../../infrastructure/guards/bearer-auth.guard';
import {CheckUserIdGuard} from '../../../infrastructure/guards/check-userId.guard';
import {CommentsQueryRepository} from '../infrastructure/comments.query.repository';
import {CommentViewModel} from './models/view/comment.view.model';
import {LikeStatusInputModel} from './models/input/like.status.input.model';
import {UsersRepository} from '../../users/infrastructure/users.repository';
import {CommandBus} from '@nestjs/cqrs';
import {UpdateCommentLikesCommand} from '../application/use.cases/update.comment.likes.use.case';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsService: CommentsService,
    private commentsQueryRepository: CommentsQueryRepository,
    private usersRepository: UsersRepository,

    private commandBus: CommandBus,
  ) {}

  @Get(':id')
  @UseGuards(CheckUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getComment(
    @Req() req,
    @Param('id') commentId: string,
  ): Promise<CommentViewModel | null> {
    // если юзер забанен, мы не можем получить его коммент
    const comment = await this.commentsQueryRepository.getComment(
      commentId,
      req.userId,
    );
    if (!comment) throw new NotFoundException();

    const user = await this.usersRepository.getUserById(
      comment.commentatorInfo.userId,
    );
    if (user?.banInfo.isBanned) {
      throw new NotFoundException();
    } else {
      return comment;
    }
  }

  @Put(':id')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Req() req,
    @Param('id') commentId: string,
    @Body() InputModel: CommentInputModel,
  ) {
    const comment = await this.commentsQueryRepository.getComment(
      commentId,
      req.userId,
    );
    if (!comment) throw new NotFoundException();
    if (req.userId !== comment.commentatorInfo.userId) {
      throw new ForbiddenException();
    }
    return this.commandBus.execute(new UpdateCommentLikesCommand(
      commentId,
      InputModel.content
    ));
  }

  @Delete(':id')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Req() req, @Param('id') commentId: string) {
    const comment = await this.commentsQueryRepository.getComment(
      commentId,
      req.userId,
    );
    if (!comment) throw new NotFoundException();
    if (req.userId !== comment.commentatorInfo.userId) {
      throw new ForbiddenException();
    }
    return this.commentsService.deleteComment(commentId);
  }

  @Put(':id/like-status')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Req() req,
    @Param('id') commentId: string,
    @Body() InputModel: LikeStatusInputModel,
  ) {
    const comment = await this.commentsQueryRepository.getComment(
      commentId,
    );
    if (!comment) {
      throw new NotFoundException();
    } else {
      return this.commentsService.updateCommentLikes(
        commentId,
        req.userId,
        InputModel.likeStatus,
      );
    }
  }
}
