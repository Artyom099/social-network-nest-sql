import {Column, Entity, ManyToOne, PrimaryColumn} from 'typeorm';
import {LikeStatus} from '../../../infrastructure/utils/constants';
import {Comments} from './сomment.entity';

@Entity()
export class CommentLikes {
  @PrimaryColumn()
  userId: string;
  @Column()
  status: LikeStatus;

  @ManyToOne(() => Comments, c => c.likes)
  comment: Comments
}