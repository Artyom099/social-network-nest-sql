import {Injectable} from '@nestjs/common';
import {PostInputModel} from '../api/models/input/post.input.model';
import {LikeStatus} from '../../../infrastructure/utils/constants';
import {InjectModel} from '@nestjs/mongoose';
import {Post3, PostDocument} from '../posts.schema';
import {Model} from 'mongoose';
import {PostViewModel} from '../api/models/view/post.view.model';
import {CreatePostModel} from '../api/models/dto/create.post.model';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {id} from 'date-fns/locale';
import {UpdatePostLikesModel} from '../api/models/dto/update.post.likes.model';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectModel(Post3.name) private postModel: Model<PostDocument>
  ) {}

  async createPost2(post: CreatePostModel) {
    await this.postModel.create(post);
    return {
      // id: newPost._id.toString(),
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    };
  }
  async updatePost2(id: string, InputModel: PostInputModel) {
    return this.postModel.updateOne(
      { id },
      {
        title: InputModel.title,
        shortDescription: InputModel.shortDescription,
        content: InputModel.content,
      },
    );
  }
  async deletePost2(id: string) {
    return this.postModel.deleteOne({ id });
  }

  async updatePostLikes(dto: UpdatePostLikesModel) {
    const post = await this.postModel.findOne({ id });
    if (!post) return false;
    // если юзер есть в массиве, обновляем его статус
    for (const s of post.extendedLikesInfo) {
      if (s.userId === dto.userId) {
        if (s.status === dto.newLikeStatus) return true;
        return this.postModel.updateOne(
          { id },
          {
            extendedLikesInfo: {
              addedAt: dto.addedAt,
              userId: dto.userId,
              status: dto.newLikeStatus,
              login: dto.login,
            },
          },
        );
      }
    }
    // иначе добавляем юзера, его лайк статус, дату и логин в массив
    return this.postModel.updateOne(
      { id },
      {
        $addToSet: {
          extendedLikesInfo: {
            addedAt: dto.addedAt,
            userId: dto.userId,
            status: dto.newLikeStatus,
            login: dto.login,
          },
        },
      },
    );
  }

  // SQL
  async createPost(dto: CreatePostModel): Promise<PostViewModel> {
    await this.dataSource.query(`
    insert into "Posts"
    ("id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt")
    values ($1, $2, $3, $4, $5, $6, $7)
    `, [
      dto.id,
      dto.title,
      dto.shortDescription,
      dto.content,
      dto.blogId,
      dto.blogName,
      dto.createdAt,
    ])

    const [post] = await this.dataSource.query(`
    select *
    from "Posts"
    where "id" = $1
    `, [dto.id])

    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    }
  }
  async updatePost(id: string, inputModel: PostInputModel) {
    return this.dataSource.query(`
    update "Posts"
    set "title" = $1, "shortDescription" = $2, "content" = $3
    where "id" = $4
    `, [
      inputModel.title,
      inputModel.shortDescription,
      inputModel.content,
      id,
    ])
  }
  async deletePost(id: string) {
    return this.dataSource.query(`
    delete from "Posts"
    where "id" = $1
    `, [id])
  }

  async updatePostLikes2(dto: UpdatePostLikesModel) {
    return this.dataSource.query(`
    update "Posts"
    set
    `)
  }
}
