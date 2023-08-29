import {Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {BannedUsersForBlog} from './banned.user.for.blog.entity';
import {Devices} from '../../devices/device.entity';
import {Blogs} from '../../blogs/blog.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  login: string;
  @Column()
  email: string;
  @Column()
  passwordSalt: string;
  @Column()
  passwordHash: string;
  @Column()
  createdAt: Date;
  @Column()
  isBanned: boolean;
  @Column({nullable: true})
  banDate: Date;
  @Column({nullable: true})
  banReason: string;
  @Column()
  confirmationCode: string;
  @Column({nullable: true})
  expirationDate: Date;
  @Column()
  isConfirmed: boolean;
  @Column({nullable: true})
  recoveryCode: string;

  @OneToOne(() => BannedUsersForBlog, b => b.user)
  bannedUsersForBlog: BannedUsersForBlog;

  @OneToMany(() => Devices, d => d.user)
  devices: Devices[];

  @OneToMany(() => Blogs, b => b.user)
  blogs: Blogs[];
}