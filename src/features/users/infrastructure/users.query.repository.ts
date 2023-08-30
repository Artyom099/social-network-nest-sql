import {Injectable} from '@nestjs/common';
import {UsersPaginationInput,} from '../../../infrastructure/models/pagination.input.models';
import {SAUserViewModel} from '../api/models/view/sa.user.view.model';
import {UserViewModel} from '../api/models/view/user.view.model';
import {PaginationViewModel} from '../../../infrastructure/models/pagination.view.model';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async getUserById(id: string): Promise<UserViewModel | null> {
    const user = await this.dataSource.query(`
    select "id", "login", "email", "createdAt"
    from "users"
    where "id" = $1
    `, [id])

    return user.length ? user[0] : null
  }

  async getUserByIdSA(id: string): Promise<SAUserViewModel | null> {
    const user = await this.dataSource.query(`
    select "id", "login", "email", "createdAt", "isBanned", "banDate", "banReason"
    from "users"
    where "id" = $1
    `, [id])

    return user.length ? {
      id: user[0].id,
      login: user[0].login,
      email: user[0].email,
      createdAt: user[0].createdAt,
      banInfo: {
        isBanned: user[0].isBanned,
        banDate: user[0].banDate,
        banReason: user[0].banReason,
      },
    } : null
  }
  async getUserByLoginOrEmail(logOrMail: string): Promise<any | null> {
    const user = await this.dataSource.query(`
    select *
    from "users"
    where "login" like $1 or "email" like $1
    `, [ `%${logOrMail}%` ])

    return user.length ? {
      id: user[0].id,
      login: user[0].login,
      email: user[0].email,
      salt: user[0].passwordSalt,
      hash: user[0].passwordHash,
      createdAt: user[0].createdAt,
      isConfirmed: user[0].isConfirmed,
      confirmationCode: user[0].confirmationCode,
      passwordSalt: user[0].passwordSalt,
      passwordHash: user[0].passwordHash,
      banInfo: {
        isBanned: user[0].isBanned,
        banDate: user[0].banDate,
        banReason: user[0].banReason,
      },
    } : null

  }
  async getUserByRecoveryCode(code: string): Promise<SAUserViewModel | null> {
    const user = await this.dataSource.query(`
    select *
    from "users"
    where "recoveryCode" = $1
    `, [code])

    return user.length ? {
      id: user[0].id,
      login: user[0].login,
      email: user[0].email,
      createdAt: user[0].createdAt,
      banInfo: {
        isBanned: user[0].isBanned,
        banDate: user[0].banDate,
        banReason: user[0].banReason,
      },
    } :null
  }
  async getUserByConfirmationCode(code: string): Promise<any | null> {
    const user = await this.dataSource.query(`
    select *
    from "users"
    where "confirmationCode" = $1
    `, [code])

    return user.length ? {
      id: user[0].id,
      login: user[0].login,
      email: user[0].email,
      createdAt: user[0].createdAt,
      isConfirmed: user[0].isConfirmed,
      confirmationCode: user[0].confirmationCode,
      expirationDate: user[0].expirationDate,
      banInfo: {
        isBanned: user[0].isBanned,
        banDate: user[0].banDate,
        banReason: user[0].banReason,
      },
    } : null
  }

  async getSortedUsersToSA(query: UsersPaginationInput): Promise<PaginationViewModel<SAUserViewModel[]>> {
  const [totalCount] = await this.dataSource.query(`
  select count(*)
  from "users"
  where ("login" ilike $1 or "email" ilike $2)
  and ("isBanned" = $3 or $3 is null)
  `, [
    `%${query.searchLoginTerm}%`,
    `%${query.searchEmailTerm}%`,
    query.banStatus,
  ])

  const queryString = `
  select "id", "login", "email", "createdAt", "isBanned", "banDate", "banReason"
  from "users"
  where ("login" ilike $1 or "email" ilike $2)
  and ("isBanned" = $3 or $3 is null)
  order by "${query.sortBy}" ${query.sortDirection}
  limit $4
  offset $5
  `

    const sortedUsers = await this.dataSource.query(queryString, [
      `%${query.searchLoginTerm}%`,
      `%${query.searchEmailTerm}%`,
      query.banStatus,
      query.pageSize,
      query.offset(),
    ])

    const items = sortedUsers.map((u) => {
      return {
        id: u.id,
        login: u.login,
        email: u.email,
        createdAt: u.createdAt,
        banInfo: {
          isBanned: u.isBanned,
          banDate: u.banDate,
          banReason: u.banReason,
        },
      };
    });

    return {
      pagesCount: query.pagesCountSql(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount: query.totalCountSql(totalCount), // общее количество пользователей
      items,
    };

  }
}
