import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Blog3, BlogDocument} from '../blogs/blogs.schema';
import {Post3, PostDocument} from '../posts/posts.schema';
import {Comment3, CommentDocument} from '../comments/comments.schema';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';

@Injectable()
export class TestRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectModel(Blog3.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post3.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment3.name) private commentModel: Model<CommentDocument>,
  ) {}

  async deleteAllData() {
    return Promise.all([
      this.blogModel.deleteMany(),
      this.postModel.deleteMany(),
      this.commentModel.deleteMany(),

      this.dataSource.query(`
      delete from "banned_users_for_blog";
      delete from "devices";
      delete from "posts";
      delete from "blogs";
      delete from "users";
      `)
    ]);
  }
}
