import {Injectable} from '@nestjs/common';
import {UsersPaginationInput,} from '../../../infrastructure/utils/common.models';
import {User, UserDocument} from '../schemas/users.schema';
import {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {SAUserViewModel} from '../api/models/view/sa.user.view.model';
import {UserViewModel} from '../api/models/view/user.view.model';
import {PagingViewModel} from '../../../infrastructure/types/paging.view.model';
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectDataSource() private dataSource: DataSource,
  ) {
  }

  async getUserById(id: string): Promise<UserViewModel | null> {
    const user = await this.dataSource.query(`
    select "id", "login", "email", "createdAt"
    from "Users"
    where "id" = $1
    `, [id])

    return user.length ? user[0] : null
  }

  async getSortedUsersToSA(query: UsersPaginationInput): Promise<PagingViewModel<SAUserViewModel[]>> {
    const [totalCount] = await this.dataSource.query(`
    select count(*)
    from "Users"
    where "login" like $1 or "email" like $2
    and "isBanned" = $3 or $3 is null
    `, [
      `%${query.searchLoginTerm}%`,
      `%${query.searchEmailTerm}%`,
      query.banStatus
    ])

    const queryString = `
    select "id", "login", "email", "createdAt", "isBanned", "banDate", "banReason"
    from "Users"
    where "login" like $1 or "email" like $2
    and "isBanned" = $3 or $3 is null
    order by "${query.sortBy}" ${query.sortDirection}
    limit $4
    offset $5
    `

    const sortedUsers = await this.dataSource.query(queryString, [
      `%${query.searchLoginTerm}%`,
      `%${query.searchEmailTerm}%`,
      query.banStatus,
      query.pageSize,
      query.skip()
    ])

    const items = sortedUsers.map((u) => {
      return {
        id: u.id,
        login: u.login,
        email: u.email,
        createdAt: u.createdAt.toISOString(),
        banInfo: {
          isBanned: u.isBanned,
          banDate: u.banDate ? u.banDate.toISOString() : null,
          banReason: u.banReason,
        },
      };
    });

    return {
      pagesCount: query.pagesCount(totalCount.count), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount: parseInt(totalCount.count, 10), // общее количество пользователей
      items,
    };
  }
}
