import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {BannedUsersPaginationInput} from "../../../infrastructure/utils/common.models";
import {PagingViewModel} from "../../../infrastructure/types/paging.view.model";
import {BannedUserForBlogViewModel} from "../api/models/view/banned.user.for.blog.view.model";
import {InjectModel} from "@nestjs/mongoose";
import {BannedUserForBlog, BannedUserForBlogModelType} from "../schemas/banned.users.for.blog.schema";

@Injectable()
export class BannedUsersForBlogQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectModel(BannedUserForBlog.name)
    private BannedUserForBlogModel: BannedUserForBlogModelType,
  ) {
  }

  async getBannedUsersCurrentBlog2(
    blogId: string,
    query: BannedUsersPaginationInput,
  ): Promise<PagingViewModel<BannedUserForBlogViewModel[]>> {
    const filter = {blogId, 'banInfo.isBanned': true};
    const totalCount = await this.BannedUserForBlogModel.countDocuments(filter);
    const sortedUsers = await this.BannedUserForBlogModel.find(filter)
      .sort(query.sortBannedUsers())
      .skip(query.skip())
      .limit(query.pageSize)
      .lean()
      .exec();

    const items = sortedUsers.map((u) => {
      return {
        id: u.id,
        login: u.login,
        banInfo: {
          isBanned: u.banInfo.isBanned,
          banDate: u.banInfo.banDate ? u.banInfo.banDate.toISOString() : null,
          banReason: u.banInfo.banReason,
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

  async getBannedUsersCurrentBlog(
    blogId: string,
    query: BannedUsersPaginationInput,
  ): Promise<PagingViewModel<BannedUserForBlogViewModel[]>> {
    const [totalCount] = await this.dataSource.query(`
      select count(*)
      from "BannedUsersForBlog"
      where "isBanned" = true and "blogId" = $1
      `, [blogId])

    const sortedUsers = await this.dataSource.query(`
    select "userId" as "id", "login", "blogId", "isBanned", "banDate", "banReason"
    from "BannedUsersForBlog"
    where "isBanned" = true and "blogId" = $1
    order by "${query.sortBy}" ${query.sortDirection}
    limit $2 
    offset $3
    `, [
      blogId,
      query.pageSize,
      query.skip()
    ])

    const items = sortedUsers.map((u) => {
      return {
        id: u.id,
        login: u.login,
        banInfo: {
          isBanned: u.isBanned,
          banDate: u.banDate ? u.banDate.toISOString() : null,
          banReason: u.banReason,
        },
      };
    });

    return {
      pagesCount: query.pagesCount(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount: parseInt(totalCount.count, 10), // общее количество пользователей
      items,
    };
  }
}