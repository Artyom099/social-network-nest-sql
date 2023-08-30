import {Injectable} from '@nestjs/common';
import {DefaultPaginationInput} from '../../../infrastructure/models/pagination.input.models';
import {LikeStatus} from '../../../infrastructure/utils/constants';
import {CommentViewModel} from '../api/models/view/comment.view.model';
import {PaginationViewModel} from '../../../infrastructure/models/pagination.view.model';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getComment(
    id: string,
    currentUserId?: string | null,
  ): Promise<CommentViewModel | null> {
    const [comment] = await this.dataSource.query(`
    select *
    from "comments"
    where "id" = $1
    `, [id])

    const [myLikeInfo] = await this.dataSource.query(`
    select *
    from "comment_likes"
    where "commentId" = $1 and "userId" = $2
    `, [id, currentUserId])

    return comment ? {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: myLikeInfo ? myLikeInfo.status : LikeStatus.None,
      },
    } : null
  }

  async getCommentsCurrentPost(
    currentUserId: string | null,
    postId: string,
    query: DefaultPaginationInput,
  ): Promise<PaginationViewModel<CommentViewModel[]>> {
    const [totalCount] = await this.dataSource.query(`
    select count(*)
    from "comments"
    where "postId" = $1
    `, [postId])

    const sortedComments = await this.dataSource.query(`
    select *
    from "comments"
    where "postId" = $1
    order by "${query.sortBy}" ${query.sortDirection}
    limit $2
    offset $3
    `, [
      postId,
      query.pageSize,
      query.offset(),
    ])

    const items = await Promise.all(sortedComments.map(async (c): Promise<CommentViewModel> => {
      const [myLikeInfo] = await this.dataSource.query(`
      select *
      from "comment_likes"
      where "commentId" = $1 and "userId" = $2
      `, [c.id, currentUserId])

      return {
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        commentatorInfo: {
          userId: c.userId,
          userLogin: c.userLogin,
        },
        likesInfo: {
          likesCount: c.likesCount,
          dislikesCount: c.dislikesCount,
          myStatus: myLikeInfo ? myLikeInfo.status : LikeStatus.None,
        },
      }
    }))

    return {
      pagesCount: query.pagesCountSql(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount: query.totalCountSql(totalCount), // общее количество пользователей
      items,
    };
  }

  async getCommentsCurrentBlogger(
    currentUserId: string,
    query: DefaultPaginationInput,
  ): Promise<PaginationViewModel<CommentViewModel[]>> {
    const [totalCount] = await this.dataSource.query(`
    select count (*)
    from "comments"
    where "userId" = $1
    `, [currentUserId])

    const sortedComments = await this.dataSource.query(`
    select *
    from "comments"
    where "userId" = $1
    order by "${query.sortBy}" ${query.sortDirection}
    limit $2
    offset $3
    `, [
      currentUserId,
      query.pageSize,
      query.offset(),
    ])

    const items = await Promise.all(sortedComments.map(async (c) => {
      const [myLikeInfo] = await this.dataSource.query(`
      select *
      from "comment_likes"
      where "userId" = $1 and "commentId" = $2
      `, [currentUserId, c.id])

      return {
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        commentatorInfo: {
          userId: c.userId,
          userLogin: c.userLogin,
        },
        likesInfo: {
          likesCount: c.likesCount,
          dislikesCount: c.dislikesCount,
          myStatus: myLikeInfo ? myLikeInfo.status : LikeStatus.None,
        },
        postInfo: {
          id: c.postId,
          title: c.postTitle,
          blogId: c.blogId,
          blogName: c.blogName,
        },
      }
    }))

    return {
      pagesCount: query.pagesCountSql(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount: query.totalCountSql(totalCount), // общее количество пользователей
      items,
    }
  }
}
