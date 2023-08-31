import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Users} from './user.entity';
import {Blogs} from '../../blogs/blog.entity';

@Entity()
export class BannedUsersForBlog {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  isBanned: boolean;
  @Column()
  banDate: Date;
  @Column()
  banReason: string;

  @OneToOne(() => Users, u => u.bannedUsersForBlog)
  @JoinColumn()
  user: Users;
  @Column()
  login: string;
  @Column()
  createdAt: string;

  @OneToOne(() => Blogs, b => b.bannedUsersForBlog)
  @JoinColumn()
  blog: Blogs;
}