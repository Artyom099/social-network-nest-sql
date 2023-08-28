import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument, Model} from 'mongoose';
import {randomUUID} from 'crypto';
import add from 'date-fns/add';
import {CreateUserInputModel} from '../api/models/input/create.user.input.model';
import {SAUserViewModel} from '../api/models/view/sa.user.view.model';
import {UserViewModel} from '../api/models/view/user.view.model';

@Schema({ _id: false, versionKey: false })
class AccountData {
  @Prop({ required: true, type: String, unique: true })
  login: string;
  @Prop({ required: true, type: String, unique: true })
  email: string;
  @Prop({ required: true, type: String })
  passwordSalt: string;
  @Prop({ required: true, type: String })
  passwordHash: string;
  @Prop({ required: true, type: Date })
  createdAt: Date;
}
const AccountDataSchema = SchemaFactory.createForClass(AccountData);

@Schema({ _id: false, versionKey: false })
class BanInfo {
  @Prop({ required: true, type: Boolean })
  isBanned: boolean;
  @Prop({ required: false, type: Date || null })
  banDate: Date | null;
  @Prop({ required: false, type: String || null })
  banReason: string | null;
}
const BanInfoSchema = SchemaFactory.createForClass(BanInfo);

@Schema({ _id: false, versionKey: false })
class EmailConfirmation {
  @Prop({ required: true, type: String })
  confirmationCode: string;
  @Prop({ required: true, type: Date })
  expirationDate: Date;
  @Prop({ required: true, type: Boolean })
  isConfirmed: boolean;
}
const EmailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation);

export type UserDocument = HydratedDocument<User3>;
@Schema({ versionKey: false })
export class User3 {
  @Prop({ required: true, type: String, unique: true, index: true })
  id: string;
  @Prop({ required: true, type: String })
  recoveryCode: string;

  @Prop({ required: true, type: AccountDataSchema })
  accountData: AccountData;
  @Prop({ required: true, type: BanInfoSchema })
  banInfo: BanInfo;
  @Prop({ required: true, type: EmailConfirmationSchema })
  emailConfirmation: EmailConfirmation;

  static createUserByAdmin(
    InputModel: CreateUserInputModel,
    passwordSalt: string,
    passwordHash: string,
    UserModel: UserModelType,
  ): UserDocument {
    const data = {
      id: randomUUID(),
      accountData: {
        login: InputModel.login,
        email: InputModel.email,
        passwordSalt,
        passwordHash,
        createdAt: new Date(),
      },
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
      emailConfirmation: {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), { minutes: 10 }),
        isConfirmed: true,
      },
      recoveryCode: randomUUID(),
    };
    return new UserModel(data);
  }

  static createUserBySelf(
    InputModel: CreateUserInputModel,
    passwordSalt: string,
    passwordHash: string,
    UserModel: UserModelType,
  ): UserDocument {
    const data = {
      id: randomUUID(),
      accountData: {
        login: InputModel.login,
        email: InputModel.email,
        passwordSalt,
        passwordHash,
        createdAt: new Date(),
      },
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
      emailConfirmation: {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), { minutes: 10 }),
        isConfirmed: false,
      },
      recoveryCode: randomUUID(),
    };
    return new UserModel(data);
  }

  getViewModel(): UserViewModel {
    return {
      id: this.id,
      login: this.accountData.login,
      email: this.accountData.email,
      createdAt: this.accountData.createdAt.toISOString(),
    };
  }
  getSAViewModel(): SAUserViewModel {
    return {
      id: this.id,
      login: this.accountData.login,
      email: this.accountData.email,
      createdAt: this.accountData.createdAt.toISOString(),
      banInfo: {
        isBanned: this.banInfo.isBanned,
        banDate: this.banInfo.banDate
          ? this.banInfo.banDate.toISOString()
          : null,
        banReason: this.banInfo.banReason,
      },
    };
  }

  confirmEmail(code: string): boolean {
    if (
      this &&
      !this.emailConfirmation.isConfirmed &&
      this.emailConfirmation.confirmationCode === code &&
      this.emailConfirmation.expirationDate > new Date()
    ) {
      this.emailConfirmation.isConfirmed = true;
      return true;
    } else {
      return false;
    }
  }
  updateSaltAndHash(salt: string, hash: string) {
    this.accountData.passwordSalt = salt;
    this.accountData.passwordHash = hash;
  }
  updateRecoveryCode(): string {
    const code = randomUUID();
    this.recoveryCode = code;
    return code;
  }
  updateConfirmationCode(): string {
    const newCode = randomUUID();
    this.emailConfirmation.confirmationCode = newCode;
    return newCode;
  }

  banUser(reason: string) {
    this.banInfo.isBanned = true;
    this.banInfo.banReason = reason;
    this.banInfo.banDate = new Date();
  }
  unbanUser() {
    this.banInfo.isBanned = false;
    this.banInfo.banReason = null;
    this.banInfo.banDate = null;
  }
}
export const UserSchema = SchemaFactory.createForClass(User3);

UserSchema.methods = {
  getViewModel: User3.prototype.getViewModel,
  getSAViewModel: User3.prototype.getSAViewModel,
  confirmEmail: User3.prototype.confirmEmail,
  updateSaltAndHash: User3.prototype.updateSaltAndHash,
  updateRecoveryCode: User3.prototype.updateRecoveryCode,
  updateConfirmationCode: User3.prototype.updateConfirmationCode,
  banUser: User3.prototype.banUser,
  unbanUser: User3.prototype.unbanUser,
};
export type UserModelStaticType = {
  createUserByAdmin: (
    InputModel: CreateUserInputModel,
    passwordSalt: string,
    passwordHash: string,
    UserModel: UserModelType,
  ) => UserDocument;
  createUserBySelf: (
    InputModel: CreateUserInputModel,
    passwordSalt: string,
    passwordHash: string,
    UserModel: UserModelType,
  ) => UserDocument;
};
export type UserModelType = Model<User3> & UserModelStaticType;
const userStaticMethods: UserModelStaticType = {
  createUserByAdmin: User3.createUserByAdmin,
  createUserBySelf: User3.createUserBySelf,
};
UserSchema.statics = userStaticMethods;