import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity()
export class Blog {
  @PrimaryColumn()
  id: string;
  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  websiteUrl: string;
  @Column()
  createdAt: Date;
  @Column()
  isMembership: boolean;
  @Column()
  userId: string;
  @Column()
  userLogin: string;
  @Column()
  isBanned: boolean;
  @Column()
  banDate: Date;
}