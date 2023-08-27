import {Injectable} from '@nestjs/common';
import {DefaultPaginationInput} from '../../../infrastructure/models/pagination.input.models';
import {LikeStatus} from '../../../infrastructure/utils/constants';
import {InjectModel} from '@nestjs/mongoose';
import {Post3, PostDocument} from '../posts.schema';
import {Model} from 'mongoose';
import {User3, UserDocument} from '../../users/entity/users.schema';
import {NewestLikesViewModel, PostViewModel,} from '../api/models/view/post.view.model';
import {ExtendedLikesInfoDBModel} from '../api/models/dto/create.post.model';
import {PaginationViewModel} from '../../../infrastructure/models/pagination.view.model';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectModel(Post3.name) private postModel: Model<PostDocument>,
    @InjectModel(User3.name) private userModel: Model<UserDocument>,
  ) {}

  async getPost2(
    id: string,
    currentUserId?: string | null,
  ): Promise<PostViewModel | null> {
    const post = await this.postModel.findOne({ id }).exec();

    if (!post) return null;
    let myStatus = LikeStatus.None;
    let likesCount = 0;
    let dislikesCount = 0;
    const newestLikes: NewestLikesViewModel[] = [];

    const bannedUsers = await this.userModel
      .find({ 'banInfo.isBanned': true })
      .lean()
      .exec();
    const idBannedUsers = bannedUsers.map((u) => u.id);

    post.extendedLikesInfo.forEach((l) => {
      if (l.userId === currentUserId) myStatus = l.status;
      if (idBannedUsers.includes(l.userId)) return;
      if (l.status === LikeStatus.Dislike) dislikesCount++;
      if (l.status === LikeStatus.Like) {
        likesCount++;
        newestLikes.push({
          addedAt: l.addedAt,
          userId: l.userId,
          login: l.login,
        });
      }
    });
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount,
        dislikesCount,
        myStatus,
        newestLikes: newestLikes
          .sort((a, b) => parseInt(a.addedAt) - parseInt(b.addedAt))
          .slice(-3)
          .reverse(),
      },
    };
  }

  async getPosts2(
    currentUserId: string,
    query: DefaultPaginationInput,
  ): Promise<PaginationViewModel<PostViewModel[]>> {
    const filter = { 'banInfo.isBanned': false };

    const totalCount = await this.postModel.countDocuments(filter);
    const sortedPosts = await this.postModel
      .find(filter)
      .sort(query.sort())
      .skip(query.offset())
      .limit(query.pageSize)
      .lean()
      .exec();

    const bannedUsers = await this.userModel
      .find({ 'banInfo.isBanned': true })
      .lean()
      .exec();
    const idBannedUsers = bannedUsers.map((u) => u.id);

    const items = sortedPosts.map((p) => {
      let myStatus = LikeStatus.None;
      let likesCount = 0;
      let dislikesCount = 0;
      const newestLikes: NewestLikesViewModel[] = [];
      p.extendedLikesInfo.forEach((l: ExtendedLikesInfoDBModel) => {
        if (l.userId === currentUserId) myStatus = l.status;
        if (idBannedUsers.includes(l.userId)) return;
        if (l.status === LikeStatus.Dislike) dislikesCount++;
        if (l.status === LikeStatus.Like) {
          likesCount++;
          newestLikes.push({
            addedAt: l.addedAt,
            userId: l.userId,
            login: l.login,
          });
        }
      });
      return {
        id: p.id,
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId,
        blogName: p.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount,
          dislikesCount,
          myStatus,
          newestLikes: newestLikes
            .sort((a, b) => parseInt(a.addedAt) - parseInt(b.addedAt))
            .slice(-3)
            .reverse(),
        },
      };
    });
    return {
      pagesCount: query.pagesCount(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount, // общее количество пользователей
      items,
    };
  }

  async getPostsCurrentBlog2(
    currentUserId: string | null,
    blogId: string,
    query: DefaultPaginationInput,
  ): Promise<PaginationViewModel<PostViewModel[]>> {
    const filter = { blogId, 'banInfo.isBanned': true };

    const totalCount = await this.postModel.countDocuments(filter);
    const sortedPosts = await this.postModel
      .find(filter)
      .sort(query.sort())
      .skip(query.offset())
      .limit(query.pageSize)
      .lean()
      .exec();

    const bannedUsers = await this.userModel
      .find({ 'banInfo.isBanned': true })
      .lean()
      .exec();
    const idBannedUsers = bannedUsers.map((u) => u.id);

    const items = sortedPosts.map((p) => {
      let myStatus = LikeStatus.None;
      let likesCount = 0;
      let dislikesCount = 0;
      const newestLikes: any[] = [];
      p.extendedLikesInfo.forEach((l: ExtendedLikesInfoDBModel) => {
        if (l.userId === currentUserId) myStatus = l.status;
        if (idBannedUsers.includes(l.userId)) return;
        if (l.status === LikeStatus.Dislike) dislikesCount++;
        if (l.status === LikeStatus.Like) {
          likesCount++;
          newestLikes.push({
            addedAt: l.addedAt,
            userId: l.userId,
            login: l.login,
          });
        }
      });
      return {
        id: p.id,
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId,
        blogName: p.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount,
          dislikesCount,
          myStatus,
          newestLikes: newestLikes
            .sort((a, b) => parseInt(a.addedAt) - parseInt(b.addedAt))
            .slice(-3)
            .reverse(),
        },
      };
    });

    return {
      pagesCount: query.pagesCount(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount, // общее количество пользователей
      items,
    };
  }

  async getPostsCurrentBlogForBlogger2(
    currentUserId: string | null,
    blogId: string,
    query: DefaultPaginationInput,
  ): Promise<PaginationViewModel<PostViewModel[]>> {
    const filter = { blogId };

    const totalCount = await this.postModel.countDocuments(filter);
    const sortedPosts = await this.postModel
      .find(filter)
      .sort(query.sort())
      .skip(query.offset())
      .limit(query.pageSize)
      .lean()
      .exec();

    const bannedUsers = await this.userModel
      .find({ 'banInfo.isBanned': true })
      .lean()
      .exec();
    const idBannedUsers = bannedUsers.map((u) => u.id);

    const items = sortedPosts.map((p) => {
      let myStatus = LikeStatus.None;
      let likesCount = 0;
      let dislikesCount = 0;
      const newestLikes: any[] = [];
      p.extendedLikesInfo.forEach((l: ExtendedLikesInfoDBModel) => {
        if (l.userId === currentUserId) myStatus = l.status;
        if (idBannedUsers.includes(l.userId)) return;
        if (l.status === LikeStatus.Dislike) dislikesCount++;
        if (l.status === LikeStatus.Like) {
          likesCount++;
          newestLikes.push({
            addedAt: l.addedAt,
            userId: l.userId,
            login: l.login,
          });
        }
      });
      return {
        id: p.id,
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId,
        blogName: p.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount,
          dislikesCount,
          myStatus,
          newestLikes: newestLikes
            .sort((a, b) => parseInt(a.addedAt) - parseInt(b.addedAt))
            .slice(-3)
            .reverse(),
        },
      };
    });

    return {
      pagesCount: query.pagesCount(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount, // общее количество пользователей
      items,
    };
  }

  // SQL

  async getPost(
    id: string,
    currentUserId?: string | null,
  ): Promise<PostViewModel | null> {
    const [post] = await this.dataSource.query(`
    select *
    from "Posts"
    where "id" = $1
    `, [id])

    return post ? {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      }
    } : null
  }

  async getPosts(
    currentUserId: string,
    query: DefaultPaginationInput,
  ): Promise<PaginationViewModel<PostViewModel[]>> {
    const [totalCount] = await this.dataSource.query(`
    select count (*)
    from "Posts"
    `)

    // where "isBanned" = false

    const sortedPosts = await this.dataSource.query(`
    select *
    from "Posts"
    order by "${query.sortBy}" ${query.sortDirection}
    limit $1
    offset $2
    `, [
      query.pageSize,
      query.offset(),
    ])

    const items = sortedPosts.map((p) => {
      return {
        id: p.id,
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId,
        blogName: p.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
          newestLikes: [],
        }
      }
    })

    console.log({totalCount: totalCount});
    console.log({sortedPosts: sortedPosts});
    console.log({pagesCount: query.pagesCountSql(totalCount)});
    console.log({totalCount: query.totalCountSql(totalCount)});

    return {
      pagesCount: query.pagesCountSql(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount: query.totalCountSql(totalCount), // общее количество пользователей
      items,
    };
  }

  async getPostsCurrentBlog(
    currentUserId: string | null,
    blogId: string,
    query: DefaultPaginationInput,
  ): Promise<PaginationViewModel<PostViewModel[]>> {
    const totalCount = await this.dataSource.query(`
    select count (*)
    from "Posts"
    where "isBanned" = false and "blogId" = $1
    `, [blogId])

    const sortedPosts = await this.dataSource.query(`
    select *
    from "Posts"
    where "isBanned" = false and "blogId" = $1
    order by "${query.sortBy}" ${query.sortDirection}
    limit $2
    offset $3
    `, [
      blogId,
      query.pageSize,
      query.offset(),
    ])

    const items = sortedPosts.map((p) => {
      return {
        id: p.id,
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId,
        blogName: p.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
          newestLikes: [],
        }
      }
    })

    return {
      pagesCount: query.pagesCountSql(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount: query.totalCountSql(totalCount), // общее количество пользователей
      items,
    };
  }

  async getPostsCurrentBlogForBlogger(
    currentUserId: string | null,
    blogId: string,
    query: DefaultPaginationInput,
  ): Promise<PaginationViewModel<PostViewModel[]>> {
    const [totalCount] = await this.dataSource.query(`
    select count (*)
    from "Posts"
    where "blogId" = $1
    `, [blogId])
    // "isBanned" = false

    const sortedPosts = await this.dataSource.query(`
    select *
    from "Posts"
    where "blogId" = $1
    order by "${query.sortBy}" ${query.sortDirection}
    limit $2
    offset $3
    `, [
      blogId,
      query.pageSize,
      query.offset(),
    ])

    const items = sortedPosts.map((p) => {
      return {
        id: p.id,
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId,
        blogName: p.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
          newestLikes: [],
        }
      }
    })

    return {
      pagesCount: query.pagesCountSql(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount: query.totalCountSql(totalCount), // общее количество пользователей
      items,
    };
  }
}
