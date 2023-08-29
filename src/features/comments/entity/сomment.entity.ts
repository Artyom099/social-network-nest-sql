import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {CommentLikes} from './comment.likes.entity';
import {Posts} from '../../posts/entity/post.entity';

@Entity()
export class Comments {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  content: string;
  @Column()
  createdAt: Date;

  @Column()
  userId: string;
  @Column()
  userLogin: string;

  @Column({ nullable: true })
  postId: string;
  @Column()
  postTitle: string;

  @Column()
  blogId: string;
  @Column()
  blogName: string;

  @Column({ default: 0 })
  likesCount: number;
  @Column({ default: 0 })
  dislikesCount: number;

  @ManyToOne(() => Posts, p => p.comments)
  post: Posts
  @OneToMany(() => CommentLikes, l => l.comment)
  likes: CommentLikes
}