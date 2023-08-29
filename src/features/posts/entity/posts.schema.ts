import {HydratedDocument} from 'mongoose';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {LikeStatus} from '../../../infrastructure/utils/constants';
import {randomUUID} from 'crypto';
import {SABlogViewModel} from '../../blogs/api/models/view/sa.blog.view.model';
import {PostInputModel} from '../api/models/input/post.input.model';

@Schema({ _id: false, versionKey: false })
class ExtendedLikesInfo {
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  login: string;
  @Prop({ required: true })
  addedAt: string;
  @Prop({ required: true, default: LikeStatus.None })
  status: LikeStatus;
}
const ExtendedLikesInfoSchema =
  SchemaFactory.createForClass<ExtendedLikesInfo>(ExtendedLikesInfo);

export type PostDocument = HydratedDocument<Post3>;

@Schema({ versionKey: false })
export class Post3 {
  @Prop({ required: true })
  id: string;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  shortDescription: string;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  blogId: string;
  @Prop({ required: true })
  blogName: string;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ type: [ExtendedLikesInfoSchema], required: true })
  extendedLikesInfo: ExtendedLikesInfo[];

  static create(
    bLog: SABlogViewModel,
    InputModel: PostInputModel,
  ) {
    const post = new Post3();
    post.id = randomUUID();
    post.title = InputModel.title;
    post.shortDescription = InputModel.shortDescription;
    post.content = InputModel.content;
    post.blogId = bLog.id;
    post.blogName = bLog.name;
    post.createdAt = new Date().toISOString();
    post.extendedLikesInfo = [];
    return post;
  }
}
export const PostSchema = SchemaFactory.createForClass(Post3);