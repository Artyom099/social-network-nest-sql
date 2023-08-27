import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity()
export class Devices {
  @PrimaryColumn()
  deviceId: string;
  @Column()
  ip: string;
  @Column()
  title: string;
  @Column()
  lastActiveDate: Date;

  // @ManyToOne(() => Users, u => u.devices)
  // user: Users;
  @Column()
  userId: string;
}