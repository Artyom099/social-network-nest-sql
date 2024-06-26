import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { UserViewModel } from "../api/models/view/user.view.model";
import { SAUserViewModel } from "../api/models/view/sa.user.view.model";
import { CreateUserDTO } from "../api/models/dto/create.user.dto";

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createUserByAdmin(dto: CreateUserDTO): Promise<SAUserViewModel> {
    await this.dataSource.query(
      `
    insert into "users"
    ("id", "login", "email", "passwordSalt", "passwordHash", "createdAt", "isBanned", "banDate", 
    "banReason", "confirmationCode", "expirationDate", "isConfirmed", "recoveryCode")
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `,
      [
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
      ]
    );

    const [user] = await this.dataSource.query(
      `
    select "id", "login", "email", "createdAt", "isBanned", "banDate", "banReason"
    from "users"
    where "login" = $1
    `,
      [dto.InputModel.login]
    );

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
    await this.dataSource.query(
      `
    insert into "users"
    ("id", "login", "email", "passwordSalt", "passwordHash", "createdAt", "isBanned", "banDate", 
    "banReason", "confirmationCode", "expirationDate", "isConfirmed", "recoveryCode")
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `,
      [
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
      ]
    );

    const [user] = await this.dataSource.query(
      `
    select "id", "login", "email", "createdAt"
    from "users"
    where "login" = $1
    `,
      [dto.InputModel.login]
    );

    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async banUser(id: string, banReason: string) {
    return this.dataSource.query(
      `
    update "users"
    set "isBanned" = true, "banReason" = $1,  "banDate" = $2
    where "id" = $3
    `,
      [banReason, new Date(), id]
    );
  }

  async unbanUser(id: string) {
    return this.dataSource.query(
      `
    update "users"
    set "isBanned" = false, "banReason" = null,  "banDate" = null
    where "id" = $1
    `,
      [id]
    );
  }

  async confirmEmail(id: string) {
    return this.dataSource.query(
      `
    update "users"
    set "isConfirmed" = true
    where "id" = $1
    `,
      [id]
    );
  }

  async updateSaltAndHash(id: string, salt: string, hash: string) {
    return this.dataSource.query(
      `
    update "users"
    set "passwordSalt" = $1, "passwordHash" = $2
    where "id" = $3
    `,
      [salt, hash, id]
    );
  }

  async updateRecoveryCode(id: string, code: string) {
    return this.dataSource.query(
      `
    update "users"
    set "recoveryCode" = $1
    where "id" = $2
    `,
      [code, id]
    );
  }

  async updateConfirmationCode(id: string, code: string) {
    return this.dataSource.query(
      `
    update "users"
    set "confirmationCode" = $1
    where "id" = $2
    `,
      [code, id]
    );
  }

  async deleteUser(id: string) {
    return this.dataSource.query(
      `
    delete from "users"
    where "id" = $1
    `,
      [id]
    );
  }
}
