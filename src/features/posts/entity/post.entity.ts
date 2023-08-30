import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Blogs} from '../../blogs/blog.entity';
import {Comments} from '../../comments/entity/сomment.entity';
import {PostLikes} from './post.likes.entity';

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

  @Column({ nullable: true })
  blogId: string;
  @Column()
  blogName: string;

  @Column({ default: 0 })
  likesCount: number;
  @Column({ default: 0 })
  dislikesCount: number;

  @ManyToOne(() => Blogs, b => b.posts)
  blog: Blogs;

  @OneToMany(() => Comments, c => c.post)
  comments: Comments

  @OneToMany(() => PostLikes, l => l.post)
  likes: PostLikes
}