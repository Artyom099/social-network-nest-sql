import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Comments {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  content: string;
  @Column()
  createdAt: Date;

  @Column()
  userId: string;
  @Column()
  userLogin: string;

  @Column()
  postId: string;
  @Column()
  postTitle: string;

  @Column()
  blogId: string;
  @Column()
  blogName: string;

  @Column({nullable: true})
  likesInfo: string;
}