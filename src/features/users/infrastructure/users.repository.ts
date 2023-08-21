import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {User, UserModelType} from '../schemas/users.schema';
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {UserViewModel} from "../api/models/view/user.view.model";
import {SAUserViewModel} from "../api/models/view/sa.user.view.model";
import {CreateUserDTO} from "../api/models/dto/create.user.dto";

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private userModel: UserModelType,
    @InjectDataSource() private dataSource: DataSource,
  ) {}
  async save(model: any) {
    return model.save();
  }


  async getUserById(id: string): Promise<SAUserViewModel | null> {
    const user = await this.dataSource.query(`
    select "id", "login", "email", "createdAt", "isBanned", "banDate", "banReason"
    from "Users"
    where "id" = $1
    `, [id])

    return user.length ? {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      banInfo: {
        isBanned: user.isBanned,
        banDate: user.banDate,
        banReason: user.banReason,
      },
    } : null
  }
  async getUserByLoginOrEmail(logOrMail: string): Promise<any | null> {
    const user = await this.dataSource.query(`
    select *
    from "Users"
    where "login" like $1 or "email" like $1
    `, [`%${logOrMail}%`])

    return user.length ? {
      id: user.id,
      login: user.login,
      email: user.email,
      salt: user.passwordSalt,
      hash: user.passwordHash,
      createdAt: user.createdAt.toISOString(),
      isConfirmed: user.isConfirmed,
      banInfo: {
        isBanned: user.isBanned,
        banDate: user.banDate ? user.banDate.toISOString() : null,
        banReason: user.banReason,
      },
    } : null

  }
  async getUserByRecoveryCode(code: string): Promise<SAUserViewModel | null> {
    const user = await this.dataSource.query(`
    select *
    from "Users"
    where "recoveryCode" = $1
    `, [code])

    return user.length ? {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      banInfo: {
        isBanned: user.isBanned,
        banDate: user.banDate ? user.banDate.toISOString() : null,
        banReason: user.banReason,
      },
    } :null
  }
  async getUserByConfirmationCode(code: string): Promise<any | null> {
    const user = await this.dataSource.query(`
    select *
    from "Users"
    where "confirmationCode" = $1
    `, [code])

    return user.length ? {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      banInfo: {
        isBanned: user.isBanned,
        banDate: user.banDate ? user.banDate.toISOString() : null,
        banReason: user.banReason,
      },
    } : null
  }

  async createUserByAdmin(dto: CreateUserDTO): Promise<SAUserViewModel> {
    await this.dataSource.query(`
    insert into "Users"
    ("login", "email", "passwordSalt", "passwordHash", "createdAt", "isBanned", "banDate", 
    "banReason", "confirmationCode", "expirationDate", "isConfirmed", "recoveryCode")
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
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
    from "Users"
    where "login" = $1
    `, [dto.InputModel.login])

    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
      banInfo: {
        isBanned: user.isBanned,
        banDate: user.banDate ? user.banDate.toISOString() : null,
        banReason: user.banReason,
      },
    };
  }
  async createUserBySelfSql(dto: CreateUserDTO): Promise<UserViewModel> {
    await this.dataSource.query(`
    insert into "Users"
    ("login", "email", "passwordSalt", "passwordHash", "createdAt", "isBanned", "banDate", 
    "banReason", "confirmationCode", "expirationDate", "isConfirmed", "recoveryCode")
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
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
    select "Id" as "id", "Login" as "login", "Email" as "email", "CreatedAt" as "createdAt",
    "IsBanned" as "isBanned", "BanDate" as "banDate", "BanReason" as "banReason"
    from "Users"
    where "Login" = $1
    `, [dto.InputModel.login])

    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async banUser(banReason: string, id: string) {
    return this.dataSource.query(`
    update "Users"
    set "banReason" = $1, "isBanned" = true, "banDate" = $2
    where "id" = $3
    `, [banReason, new Date(), id])
  }
  async unbanUser(id: string) {
    return this.dataSource.query(`
    update "Users"
    set "isBanned" = false
    where "id" = $1
    `, [id])
  }
  async confirmEmail(id: string) {
    return this.dataSource.query(`
    update "Users"
    set "isConfirmed" = true
    where "id" = $3
    `, [id])
  }
  async updateSaltAndHash(salt: string, hash: string) {
    return this.dataSource.query(`
    update "Users"
    set "passwordSalt" = $1, "passwordHash" = $2
    `, [salt, hash])
  }
  async updateConfirmationCode(code: string) {
    return this.dataSource.query(`
    update "Users"
    set "confirmationCode" = $1
    `, [code])
  }

  async deleteUser(id: string) {
    return this.dataSource.query(`
    delete from "Users"
    where "id" = $1
    `, [id])
  }
}
