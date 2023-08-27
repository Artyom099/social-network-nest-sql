import {Column, Entity, ManyToOne, PrimaryColumn} from 'typeorm';
import {User} from '../users/entity/user.entity';

@Entity()
export class Device {
  @PrimaryColumn()
  deviceId: string;
  @Column()
  ip: string;
  @Column()
  title: string;
  @Column()
  lastActiveDate: Date;

  @ManyToOne(() => User, u => u.devices)
  user: User;
  @Column()
  userId: string;
}