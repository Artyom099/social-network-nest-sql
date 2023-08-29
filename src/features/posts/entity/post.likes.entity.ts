import {Column, Entity, ManyToOne, PrimaryColumn} from 'typeorm';
import {LikeStatus} from '../../../infrastructure/utils/constants';
import {Posts} from './post.entity';

@Entity()
export class PostLikes {
  @PrimaryColumn()
  userId: string;
  @Column()
  login: string;
  @Column()
  addedAt: Date;
  @Column()
  status: LikeStatus;

  @ManyToOne(() => Posts, p => p.likes)
  post: Posts;
}