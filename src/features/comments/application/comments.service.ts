import {CommentsRepository} from '../infrastructure/comments.repository';
import {Injectable} from '@nestjs/common';
import {LikeStatus} from '../../../infrastructure/utils/constants';

@Injectable()
export class CommentsService {
  constructor(private commentsRepository: CommentsRepository) {}

  //todo - переписать на use cases

  // async updateComment(commentId: string, content: string) {
  //   return this.commentsRepository.updateComment(commentId, content);
  // }

  async deleteComment(commentId: string) {
    return this.commentsRepository.deleteComment(commentId);
  }

  async updateCommentLikes(
    commentId: string,
    currentUserId: string,
    likeStatus: LikeStatus,
  ) {
    return this.commentsRepository.updateCommentLikes(
      commentId,
      currentUserId,
      likeStatus,
    );
  }
}
