import {Module} from '@nestjs/common';
import {AuthController} from './api/auth.controller';
import {TokensService} from '../../infrastructure/services/tokens.service';
import {MongooseModule} from '@nestjs/mongoose';
import {DevicesService} from '../devices/application/devices.service';
import {DevicesRepository} from '../devices/infrastructure/devices.repository';
import {UsersQueryRepository} from '../users/infrastructure/users.query.repository';
import {DevicesQueryRepository} from '../devices/infrastructure/devices.query.repository';
import {RequestService} from '../../infrastructure/services/request.service';
import {Request, RequestSchema,} from '../../infrastructure/guards/rate.limit/request.schema';
import {JwtModule} from '@nestjs/jwt';
import {DevicesController} from '../devices/api/devices.controller';
import {HashService} from '../../infrastructure/services/hash.service';
import {SaUsersController} from '../users/api/controllers/sa.users.controller';
import {CreateUserByAdminUseCase} from '../users/application/sa.users.use.cases/create.user.use.case';
import {RegisterUserUseCase} from './application/use.cases/register.user.use.case';
import {BanUserUseCase} from '../users/application/sa.users.use.cases/ban.user.use.case';
import {CqrsModule} from '@nestjs/cqrs';
import {UnbanUserUseCase} from '../users/application/sa.users.use.cases/unban.user.use.case';
import {EmailAdapter} from '../../infrastructure/adapters/email.adapter';
import {EmailManager} from '../../infrastructure/services/email.manager';
import {DeleteUserUseCase} from '../users/application/sa.users.use.cases/delete.user.use.case';
import {ConfirmEmailUseCase} from './application/use.cases/confirm.email.use.case';
import {UpdateConfirmationCodeUseCase} from './application/use.cases/update.confirmation.code.use.case';
import {SendRecoveryCodeUseCase} from './application/use.cases/send.recovery.code.use.case';
import {UpdatePasswordUseCase} from './application/use.cases/update.password.use.case';
import {BloggerUsersController} from '../users/api/controllers/blogger.users.controller';
import {
  BanUserForCurrentBlogUseCase
} from '../users/application/blogger.users.use.cases/ban.user.for.current.blog.use.case';
import {UsersRepository} from '../users/infrastructure/users.repository';
import {BannedUsersForBlogRepository} from '../users/infrastructure/banned.users.for.blog.repository';
import {BlogsQueryRepository} from '../blogs/infrastructure/blogs.query.repository';
import {BannedUsersForBlogQueryRepository} from '../users/infrastructure/banned.users.for.blog.query.repository';
import {ResendConfirmationUseCase} from './application/use.cases/resend.confirmation.use.case';
import {CheckCredentialsUseCase} from './application/use.cases/check.credentials.use.case';
import {RefreshTokenUseCase} from './application/use.cases/refresh.token.use.case';

const useCases = [
  BanUserUseCase,
  UnbanUserUseCase,
  DeleteUserUseCase,
  ConfirmEmailUseCase,
  RegisterUserUseCase,
  RefreshTokenUseCase,
  UpdatePasswordUseCase,
  SendRecoveryCodeUseCase,
  CheckCredentialsUseCase,
  CreateUserByAdminUseCase,
  ResendConfirmationUseCase,
  BanUserForCurrentBlogUseCase,
  UpdateConfirmationCodeUseCase,
];

@Module({
  imports: [
    CqrsModule,
    JwtModule.register({
      global: true,
    }),
    MongooseModule.forFeature([
      { name: Request.name, schema: RequestSchema },
    ]),
    // TypeOrmModule.forFeature([User, BannedUserForBlog])
  ],
  controllers: [
    AuthController,
    SaUsersController,
    BloggerUsersController,
    DevicesController,
  ],
  providers: [
    ...useCases,

    RequestService,
    TokensService,

    EmailAdapter,
    EmailManager,
    BlogsQueryRepository,

    HashService,
    UsersRepository,
    UsersQueryRepository,

    BannedUsersForBlogRepository,
    BannedUsersForBlogQueryRepository,

    DevicesService,
    DevicesRepository,
    DevicesQueryRepository,
  ],
  exports: [
    TokensService,
    HashService,
    UsersRepository,
    UsersQueryRepository,
    BannedUsersForBlogRepository,
    BannedUsersForBlogQueryRepository,
  ],
})
export class AuthModule {}
