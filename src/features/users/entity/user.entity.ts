import {Column, Entity, OneToMany, OneToOne, PrimaryColumn} from 'typeorm';
import {BannedUserForBlog} from './banned.user.for.blog.entity';
import {Device} from '../../devices/device.entity';

@Entity()
export class User {
  @PrimaryColumn()
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
  @Column()
  banDate: Date;
  @Column()
  banReason: string;
  @Column()
  confirmationCode: string;
  @Column()
  expirationDate: Date;
  @Column()
  isConfirmed: boolean;
  @Column()
  recoveryCode: string;

  @OneToOne(() => BannedUserForBlog, b => b.user)
  bannedUserForBlog: BannedUserForBlog

  @OneToMany(() => Device, d => d.user)
  devices: Device[];
}