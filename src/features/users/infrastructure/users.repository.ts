import {Injectable} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {UserViewModel} from '../api/models/view/user.view.model';
import {SAUserViewModel} from '../api/models/view/sa.user.view.model';
import {CreateUserDTO} from '../api/models/dto/create.user.dto';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getUserById(id: string): Promise<SAUserViewModel | null> {
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

  async createUserByAdmin(dto: CreateUserDTO): Promise<SAUserViewModel> {
    await this.dataSource.query(`
    insert into "users"
    ("id", "login", "email", "passwordSalt", "passwordHash", "createdAt", "isBanned", "banDate", 
    "banReason", "confirmationCode", "expirationDate", "isConfirmed", "recoveryCode")
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      dto.id,
      dto.InputModel.login,
      dto.InputModel.email,
      dto.salt,
      dto.hash,
      dto.expirationDate,
      false,
      null,
      null,
      dto.confirmationCode,
      null,
      dto.isConfirmed,
      null,
    ])

    const [user] = await this.dataSource.query(`
    select "id", "login", "email", "createdAt", "isBanned", "banDate", "banReason"
    from "users"
    where "login" = $1
    `, [dto.InputModel.login])

    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      banInfo: {
        isBanned: user.isBanned,
        banDate: user.banDate,
        banReason: user.banReason,
      },
    };
  }
  async createUserBySelf(dto: CreateUserDTO): Promise<UserViewModel> {
    await this.dataSource.query(`
    insert into "users"
    ("login", "email", "passwordSalt", "passwordHash", "createdAt", "isBanned", "banDate", 
    "banReason", "confirmationCode", "expirationDate", "isConfirmed", "recoveryCode")
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      dto.id,
      dto.InputModel.login,
      dto.InputModel.email,
      dto.salt,
      dto.hash,
      dto.expirationDate,
      false,
      null,
      null,
      dto.confirmationCode,
      null,
      dto.isConfirmed,
      null,
    ])

    const [user] = await this.dataSource.query(`
    select "id", "login", "email", "createdAt", "isBanned", "banDate", "banReason"
    from "users"
    where "login" = $1
    `, [dto.InputModel.login])

    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async banUser(id: string, banReason: string) {
    return this.dataSource.query(`
    update "users"
    set "isBanned" = true, "banReason" = $1,  "banDate" = $2
    where "id" = $3
    `, [banReason, new Date(), id])
  }
  async unbanUser(id: string) {
    return this.dataSource.query(`
    update "users"
    set "isBanned" = false, "banReason" = null,  "banDate" = null
    where "id" = $1
    `, [id])
  }
  async confirmEmail(id: string) {
    return this.dataSource.query(`
    update "users"
    set "isConfirmed" = true
    where "id" = $1
    `, [id])
  }
  async updateSaltAndHash(id: string, salt: string, hash: string) {
    return this.dataSource.query(`
    update "users"
    set "passwordSalt" = $1, "passwordHash" = $2
    where "id" = $3
    `, [salt, hash, id])
  }
  async updateRecoveryCode(id: string, code: string) {
    return this.dataSource.query(`
    update "users"
    set "recoveryCode" = $1
    where "id" = $2
    `, [code, id])
  }
  async updateConfirmationCode(id: string, code: string) {
    return this.dataSource.query(`
    update "users"
    set "confirmationCode" = $1
    where "id" = $2
    `, [code, id])
  }

  async deleteUser(id: string) {
    return this.dataSource.query(`
    delete from "users"
    where "id" = $1
    `, [id])
  }
}
