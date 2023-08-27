import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Blog3, BlogDocument} from '../blogs.schema';
import {Model} from 'mongoose';
import {BlogViewModel} from '../api/models/view/blog.view.model';
import {BlogInputModel} from '../api/models/input/blog.input.model';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {CreateBlogModel} from '../api/models/dto/create.blog.model';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectModel(Blog3.name) private blogModel: Model<BlogDocument>,
  ) {}

  // SQL
  async createBlog(dto: CreateBlogModel): Promise<BlogViewModel> {
    await this.dataSource.query(`
    insert into "blogs"
    ("id", "name", "description", "websiteUrl", "createdAt", "isMembership", 
      "userId", "userLogin", "isBanned", "banDate")
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      dto.id,
      dto.inputModel.name,
      dto.inputModel.description,
      dto.inputModel.websiteUrl,
      dto.createdAt,
      dto.isMembership,
      dto.userId,
      dto.userLogin,
      dto.isBanned,
      dto.banDate,
    ])

    const [blog] = await this.dataSource.query(`
    select *
    from "blogs"
    where "id" = $1
    `, [dto.id])

    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    }
  }

  async updateBlog(id: string, InputModel: BlogInputModel) {
    return this.dataSource.query(`
    update "blogs"
    set "name" = $1, "description" = $2, "websiteUrl" = $3
    where "id" = $4
    `, [
      InputModel.name,
      InputModel.description,
      InputModel.websiteUrl,
      id,
    ])
  }
  async deleteBlog(id: string) {
    return this.dataSource.query(`
    delete from "blogs"
    where "id" = $1
    `, [id])
  }

  async updateBlogOwner(id: string, userId: string, login: string) {
    return this.dataSource.query(`
    update "blogs"
    set "userId" = $1, "login" = $2, "websiteUrl" = $3
    where "id" = $4
    `, [
      userId,
      login,
      id,
    ])
  }

  async banBlog(id: string) {
    return this.dataSource.query(`
    update "blogs"
    set "isBanned" = true
    where "id" = $1
    `, [id])
  }
  async unbanBlog(id: string) {
    return this.dataSource.query(`
    update "blogs"
    set "isBanned" = false
    where "id" = $1
    `, [id])
  }
}
