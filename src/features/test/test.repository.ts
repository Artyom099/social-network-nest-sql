import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Comment3, CommentDocument} from '../comments/comments.schema';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {Request, RequestDocument} from '../../infrastructure/guards/rate.limit/request.schema';

@Injectable()
export class TestRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectModel(Comment3.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Request.name) private requestModel: Model<RequestDocument>,
  ) {}

  async deleteAllData() {
    return Promise.all([
      this.commentModel.deleteMany(),
      this.requestModel.deleteMany(),

      this.dataSource.query(`
      delete from "banned_users_for_blog";
      delete from "devices";
      delete from "comments";
      delete from "posts";
      delete from "blogs";
      delete from "users";
      `)
    ]);
  }
}
