import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity()
export class Comments {
  @PrimaryColumn()
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

  @Column()
  likesInfo: string[];
}