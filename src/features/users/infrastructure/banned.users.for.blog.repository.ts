import {Injectable} from '@nestjs/common';
import {BanUserCurrentBlogInputModel} from '../api/models/input/ban.user.current.blog.input.model';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';

@Injectable()
export class BannedUsersForBlogRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async banUserForBlog(
    userId: string,
    login: string,
    createdAt: string,
    inputModel: BanUserCurrentBlogInputModel,
  ) {
    return this.dataSource.query(`
    insert into "banned_users_for_blog" 
    ("userId", "login", "createdAt", "blogId", "isBanned", "banDate", "banReason")
    values ($1, $2, $3, $4, $5, $6, $7)
    `, [
      userId,
      login,
      createdAt,
      inputModel.blogId,
      inputModel.isBanned,
      new Date(),
      inputModel.banReason
    ])
  }

  async unbanUserForBlog(id: string) {
    return this.dataSource.query(`
    update "banned_users_for_blog"
    set "isBanned" = false
    where "userId" = $1
    `, [id])
  }
}
