import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from 'typeorm';
import {Users} from './user.entity';

@Entity()
export class BannedUsersForBlog {
  @OneToOne(() => Users, u => u.bannedUsersForBlog)
  @JoinColumn()
  user: Users;
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