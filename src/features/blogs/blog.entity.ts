import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity()
export class Blogs {
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
  @Column({nullable: true})
  userId: string;
  @Column({nullable: true})
  userLogin: string;
  @Column()
  isBanned: boolean;
  @Column({nullable: true})
  banDate: Date;
}