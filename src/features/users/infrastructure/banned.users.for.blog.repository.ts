import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {
  BannedUserForBlog,
  BannedUserForBlogDocument,
  BannedUserForBlogModelType,
} from '../schemas/banned.users.for.blog.schema';
import {BanUserCurrentBlogInputModel} from '../api/models/input/ban.user.current.blog.input.model';
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";

@Injectable()
export class BannedUsersForBlogRepository {
  constructor(
    @InjectModel(BannedUserForBlog.name)
    private BannedUserForBlogModel: BannedUserForBlogModelType,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async save(model: any) {
    return model.save();
  }

  async getBannedUserCurrentBlog2(
    id: string,
    blogId: string,
  ): Promise<BannedUserForBlogDocument | null> {
    return this.BannedUserForBlogModel.findOne({ id, blogId });
  }
  async addUserToBanInBlog2(
    userId: string,
    login: string,
    inputModel: BanUserCurrentBlogInputModel,
  ): Promise<BannedUserForBlogDocument> {
    return BannedUserForBlog.addUserToBanInBlog(
      userId,
      login,
      inputModel,
      this.BannedUserForBlogModel,
    );
  }


  // SQL

  async getBannedUserCurrentBlog(
    id: string,
    blogId: string,
  ): Promise<BannedUserForBlogDocument | null> {
    const user = await this.dataSource.query(`
    select "userId" as "id", "login", "blogId", "isBanned", "banDate", "banReason"
    from "BannedUsersForBlog"
    where "userId" = $1 and "blogId" = $2 and "isBanned" = true
    `, [id, blogId])

    return user.length ? user[0] : null
  }

  async addUserToBanInBlog(
    userId: string,
    login: string,
    inputModel: BanUserCurrentBlogInputModel,
  ): Promise<BannedUserForBlogDocument> {
    return this.dataSource.query(`
    insert into "BannedUsersForBlog" 
    ("userId", "login", "blogId", "isBanned", "banDate", "banReason")
    values ($1, $2, $3, $4, $5, $6)
    `, [
      userId,
      login,
      inputModel.blogId,
      inputModel.isBanned,
      new Date(),
      inputModel.banReason
    ])
  }
}
