import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from 'typeorm';
import {User} from './user.entity';

@Entity()
export class BannedUserForBlog {
  @OneToOne(() => User, u => u.bannedUserForBlog)
  @JoinColumn()
  user: User;

  @PrimaryColumn()
  userId: string;
  @Column()
  login: string;
  @Column()
  blogId: string;
  @Column()
  isBanned: boolean;
  @Column()
  banDate: Date;
  @Column()
  banReason: string;
  @Column()
  createdAt: string;
}