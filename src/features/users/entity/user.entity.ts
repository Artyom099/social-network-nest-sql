import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity()
export class Users {
  @PrimaryColumn({nullable: false})
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

  // @OneToOne(() => BannedUsersForBlog, b => b.user)
  // bannedUsersForBlog: BannedUsersForBlog
  //
  // @OneToMany(() => Devices, d => d.user)
  // devices: Devices[];
}