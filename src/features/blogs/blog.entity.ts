import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Posts} from '../posts/post.entity';
import {Users} from '../users/entity/user.entity';

@Entity()
export class Blogs {
  @PrimaryGeneratedColumn('uuid')
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
  isBanned: boolean;
  @Column({nullable: true})
  banDate: Date;

  @Column({nullable: true})
  userId: string;
  @Column({nullable: true})
  userLogin: string;

  @ManyToOne(() => Users, u => u.blogs)
  user: Users;

  @OneToMany(() => Posts, p => p.blog)
  posts: Posts[];
}