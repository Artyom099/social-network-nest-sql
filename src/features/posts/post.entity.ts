import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Blogs} from '../blogs/blog.entity';

@Entity()
export class Posts {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
  @Column()
  createdAt: Date;

  @ManyToOne(() => Blogs, b => b.posts)
  blog: Blogs;

  @Column({ nullable: true })
  blogId: string;
  @Column()
  blogName: string;
}