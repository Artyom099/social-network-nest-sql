import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {BloggerBlogsController} from './features/blogs/api/controllers/blogger.blogs.controller';
import {BlogsService} from './features/blogs/application/blogs.service';
import {BlogsRepository} from './features/blogs/infrastructure/blogs.repository';
import {PostsController} from './features/posts/api/posts.controller';
import {PostsService} from './features/posts/application/posts.service';
import {PostsRepository} from './features/posts/infrastucture/posts.repository';
import {TestController} from './features/test/test.controller';
import {TestRepository} from './features/test/test.repository';
import {CommentsController} from './features/comments/api/comments.controller';
import {CommentsService} from './features/comments/application/comments.service';
import {CommentsRepository} from './features/comments/infrastructure/comments.repository';
import {MongooseModule} from '@nestjs/mongoose';
import {Blog3, BlogSchema} from './features/blogs/blogs.schema';
import {User3, UserSchema} from './features/users/entity/users.schema';
import {CommentsQueryRepository} from './features/comments/infrastructure/comments.query.repository';
import {PostsQueryRepository} from './features/posts/infrastucture/posts.query.repository';
import {BlogsQueryRepository} from './features/blogs/infrastructure/blogs.query.repository';
import {Post3, PostSchema} from './features/posts/posts.schema';
import {Comment, CommentSchema} from './features/comments/comments.schema';
import {config} from 'dotenv';
import {ConfigModule} from '@nestjs/config';
import {AuthModule} from './features/auth/auth.module';
import {Request, RequestSchema} from './infrastructure/utils/ip.schema';
import {Device3, DeviceSchema} from './features/devices/devices.schema';
import {CqrsModule} from '@nestjs/cqrs';
import {BindBlogUseCase} from './features/blogs/application/sa.use.cases/bind.blog.use.case';
import {CreateBlogUseCase} from './features/blogs/application/blogger.use.cases/create.blog.use.case';
import {PublicBlogsController} from './features/blogs/api/controllers/public.blogs.controller';
import {SABlogsController} from './features/blogs/api/controllers/sa.blogs.controller';
import {CreatePostUseCase} from './features/posts/application/blogger.use.cases/create.post.use.case';
import {CreateCommentUseCase} from './features/comments/application/use.cases/create.comment.use.case';
import {BanBlogUseCase} from './features/blogs/application/sa.use.cases/ban.blog.use.case';
import {UpdateBlogUseCase} from './features/blogs/application/blogger.use.cases/update.blog.use.case';
import {BlogExistsConstraint} from './features/users/api/models/input/ban.user.current.blog.input.model';
import {BannedUserForBlog3, BannedUserForBlogSchema,} from './features/users/entity/banned.users.for.blog.schema';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UpdateCommentLikesUseCase} from './features/comments/application/use.cases/update.comment.likes.use.case';
import process from 'process';
import {Users} from './features/users/entity/user.entity';
import {BannedUsersForBlog} from './features/users/entity/banned.user.for.blog.entity';
import {Devices} from './features/devices/device.entity';
import {Blogs} from './features/blogs/blog.entity';
import {Posts} from './features/posts/post.entity';

config();

const useCases = [
  CreateBlogUseCase,
  BindBlogUseCase,
  BanBlogUseCase,
  CreatePostUseCase,
  CreateCommentUseCase,
  UpdateBlogUseCase,
  UpdateCommentLikesUseCase,
];

@Module({
  imports: [
    AuthModule,
    CqrsModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL || ''),
    MongooseModule.forFeature([
      { name: User3.name, schema: UserSchema },
      { name: Blog3.name, schema: BlogSchema },
      { name: Post3.name, schema: PostSchema },
      { name: Device3.name, schema: DeviceSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Request.name, schema: RequestSchema },
      { name: BannedUserForBlog3.name, schema: BannedUserForBlogSchema },
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      // url: process.env.PG_REMOTE_URL,
      host: '127.0.0.1',
      port: 4000,
      username: 'postgres',
      password: 'vgy78uhb',
      database: 'postgres',
      autoLoadEntities: true,
      synchronize: true,
      // ssl: true,
    }),
    TypeOrmModule.forFeature([Users, BannedUsersForBlog, Devices, Blogs, Posts])
  ],
  controllers: [
    AppController,
    TestController,

    PublicBlogsController,
    BloggerBlogsController,
    SABlogsController,

    PostsController,
    CommentsController,
  ],
  providers: [
    ...useCases,

    AppService,
    TestRepository,

    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    BlogExistsConstraint,

    PostsService,
    PostsRepository,
    PostsQueryRepository,

    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
  ],
})
export class AppModule {}
