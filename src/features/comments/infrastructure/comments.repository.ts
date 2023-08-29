import {LikeStatus} from '../../../infrastructure/utils/constants';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Comment3, CommentDocument} from '../entity/comments.schema';
import {Model} from 'mongoose';
import {CommentViewModel} from '../api/models/view/comment.view.model';
import {CreateCommentModel} from '../api/models/dto/create.comment.model';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectModel(Comment3.name) private commentModel: Model<CommentDocument>,
  ) {}

  async createComment2(comment: Comment3): Promise<CommentViewModel> {
    await this.commentModel.create(comment);
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      },
      postInfo: {
        id: comment.postInfo.id,
        title: comment.postInfo.title,
        blogId: comment.postInfo.blogId,
        blogName: comment.postInfo.blogName,
      },
    };
  }

  async updateComment2(id: string, content: string) {
    await this.commentModel.updateOne({ id }, { content });
  }
  async deleteComment2(id: string) {
    await this.commentModel.deleteOne({ id });
  }
  async updateCommentLikes2(
    id: string,
    currentUserId: string,
    newLikeStatus: LikeStatus,
  ): Promise<boolean> {
    const comment = await this.commentModel.findOne({ id });
    if (!comment) return false;
    // если юзер есть в массиве likesInfo, обновляем его статус
    for (const s of comment.likesInfo) {
      if (s.userId === currentUserId) {
        if (s.status === newLikeStatus) return true;
        await this.commentModel.updateOne(
          { id },
          {
            likesInfo: {
              userId: currentUserId,
              status: newLikeStatus,
            },
          },
        );
        return true;
      }
    }
    // иначе добавляем юзера и его статус в массив
    await this.commentModel.updateOne(
      { id },
      {
        $addToSet: {
          likesInfo: { userId: currentUserId, status: newLikeStatus },
        },
      },
    );
    return true;
  }

  // SQL

  async createComment(dto: CreateCommentModel): Promise<CommentViewModel> {
    await this.dataSource.query(`
    insert into "comments"
    ("id", "content", "createdAt", "userId", "userLogin", "postId", "postTitle", "blogId", "blogName")
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      dto.id,
      dto.content,
      dto.createdAt,
      dto.userId,
      dto.userLogin,
      dto.postId,
      dto.postTitle,
      dto.blogId,
      dto.blogName,
    ])

    const [comment] = await this.dataSource.query(`
    select *
    from "comments"
    where "id" = $1
    `, [dto.id])

    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      },
      postInfo: {
        id: comment.postId,
        title: comment.postTitle,
        blogId: comment.blogId,
        blogName: comment.blogName,
      },
    }
  }

  async updateComment(id: string, content: string) {
    return this.dataSource.query(`
    update "comments"
    set "content" = $1
    where "id" = $2
    `, [content, id])
  }
  async deleteComment(id: string) {
    return this.dataSource.query(`
    delete from "comments"
    where "id" = $1
    `, [id])
  }
  async updateCommentLikes(
    id: string,
    currentUserId: string,
    likeStatus: LikeStatus,
  ) {
    const [commentLikes] = await this.dataSource.query(`
    select *
    from "comment_likes"
    where "commentId" = $1
    `, [id])

    if (commentLikes) {
      return this.dataSource.query(`
      update "comments"
      set "status" = $1
      where "id" = $2
      `, [likeStatus, id])
    } else {
      return this.dataSource.query(`
      insert into "comment_likes"
      ("commentId", "userId", "status")
      values ($1, $2, $3)
      `, [id, currentUserId, likeStatus])
    }
  }
}
