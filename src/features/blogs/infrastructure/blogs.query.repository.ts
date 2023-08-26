import {Injectable} from '@nestjs/common';
import {BlogsPaginationInput} from '../../../infrastructure/models/pagination.input.models';
import {InjectModel} from '@nestjs/mongoose';
import {Blog, BlogDocument} from '../blogs.schema';
import {Model} from 'mongoose';
import {SABlogViewModel} from '../api/models/view/sa.blog.view.model';
import {BlogViewModel} from '../api/models/view/blog.view.model';
import {PaginationViewModel} from '../../../infrastructure/models/pagination.view.model';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>
  ) {}

  async getBlogSA2(id: string): Promise<SABlogViewModel | null> {
    return this.blogModel.findOne({ id }, { _id: 0 });
  }
  async getBlogsSA2(query: BlogsPaginationInput): Promise<PaginationViewModel<SABlogViewModel[]>> {
    const filter = {
      name: { $regex: query.searchNameTerm ?? '', $options: 'i' },
    };
    const totalCount = await this.blogModel.countDocuments(filter);
    const items = await this.blogModel
      .find(filter, { _id: 0 })
      .sort(query.sort())
      .skip(query.offset())
      .limit(query.pageSize)
      .lean()
      .exec();

    return {
      pagesCount: query.pagesCount(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество блогов на странице
      totalCount, // общее количество блогов
      items,
    };
  }
  async getBlog2(id: string): Promise<BlogViewModel | null> {
    return this.blogModel.findOne(
      { id, 'banInfo.isBanned': false },
      { _id: 0, blogOwnerInfo: 0, banInfo: 0 },
    );
  }
  async getBlogs2(query: BlogsPaginationInput): Promise<PaginationViewModel<BlogViewModel[]>> {
    const filter = {
      'banInfo.isBanned': false,
      name: { $regex: query.searchNameTerm ?? '', $options: 'i' },
    };
    const totalCount = await this.blogModel.countDocuments(filter);
    const items = await this.blogModel
      .find(filter, { _id: 0, blogOwnerInfo: 0, banInfo: 0 })
      .sort(query.sort())
      .skip(query.offset())
      .limit(query.pageSize)
      .lean()
      .exec();

    return {
      pagesCount: query.pagesCount(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество блогов на странице
      totalCount, // общее количество блогов
      items,
    };
  }
  async getBlogsCurrentBlogger2(
    userId: string,
    query: BlogsPaginationInput,
  ): Promise<PaginationViewModel<BlogViewModel[]>> {
    const filter = {
      'banInfo.isBanned': false,
      'blogOwnerInfo.userId': userId,
      name: { $regex: query.searchNameTerm ?? '', $options: 'i' },
    };
    const totalCount = await this.blogModel.countDocuments(filter);
    const items = await this.blogModel
      .find(filter, { _id: 0, blogOwnerInfo: 0, banInfo: 0 })
      .sort(query.sort())
      .skip(query.offset())
      .limit(query.pageSize)
      .lean()
      .exec();

    return {
      pagesCount: query.pagesCount(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество блогов на странице
      totalCount, // общее количество блогов
      items,
    };
  }

  // SQL

  //super admin
  async getBlogSA(id: string): Promise<SABlogViewModel | null> {
    const [blog] = await this.dataSource.query(`
    select *
    from "Blogs"
    where "id" = $1
    `, [id])

    return blog ? {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
      blogOwnerInfo: {
        userId: blog.userId,
        userLogin: blog.userLogin,
      },
      banInfo: {
        isBanned: blog.isBanned,
        banDate: blog.banDate,
      },
    } : null
  }
  async getBlogsSA(query: BlogsPaginationInput): Promise<PaginationViewModel<SABlogViewModel[]>> {
    const [totalCount] = await this.dataSource.query(`
    select count(*)
    from "Blogs"
    where "name" ilike $1
    `, [`%${query.searchNameTerm}%`])

    const sortedBlogs = await this.dataSource.query(`
    select *
    from "Blogs"
    where "name" ilike $1
    order by "${query.sortBy}" ${query.sortDirection}
    limit $2
    offset $3
    `, [
      `%${query.searchNameTerm}%`,
      query.pageSize,
      query.offset(),
    ])

    const items = sortedBlogs.map((b) => {
      return {
        id: b.id,
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt,
        isMembership: b.isMembership,
        blogOwnerInfo: {
          userId: b.blogOwnerInfo.userId,
          userLogin: b.blogOwnerInfo.userLogin,
        },
        banInfo: {
          isBanned: b.banInfo.isBanned,
          banDate: b.banInfo.banDate,
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

  //regular user
  async getBlog(id: string): Promise<BlogViewModel | null> {
    const [blog] = await this.dataSource.query(`
    select *
    from "Blogs"
    where "id" = $1 and "isBanned" = false
    `, [id])

    return blog ? {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    } : null
  }
  async getBlogs(query: BlogsPaginationInput): Promise<PaginationViewModel<SABlogViewModel[]>> {
    const [totalCount] = await this.dataSource.query(`
    select count(*)
    from "Blogs"
    where "name" ilike $1 and "isBanned" = false
    `, [`%${query.searchNameTerm}%`])

    const sortedBlogs = await this.dataSource.query(`
    select *
    from "Blogs"
    where "name" ilike $1 and "isBanned" = false
    order by "${query.sortBy}" ${query.sortDirection}
    limit $2
    offset $3
    `, [
      `%${query.searchNameTerm}%`,
      query.pageSize,
      query.offset(),
    ])

    const items = sortedBlogs.map((b) => {
      return {
        id: b.id,
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt,
        isMembership: b.isMembership,
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

  // blogger
  async getBlogsCurrentBlogger(
    userId: string,
    query: BlogsPaginationInput,
  ): Promise<PaginationViewModel<BlogViewModel[]>> {
    const [totalCount] = await this.dataSource.query(`
    select count(*)
    from "Blogs"
    where "name" ilike $1 and "isBanned" = false and "userId" = $2
    `, [`%${query.searchNameTerm}%`, userId])

    const sortedBlogs = await this.dataSource.query(`
    select *
    from "Blogs"
    where "name" ilike $1 and "isBanned" = false and "userId" = $2
    order by "${query.sortBy}" ${query.sortDirection}
    limit $3
    offset $4
    `, [
      `%${query.searchNameTerm}%`,
      userId,
      query.pageSize,
      query.offset(),
    ])

    const items = sortedBlogs.map((b) => {
      return {
        id: b.id,
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt,
        isMembership: b.isMembership,
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
