import {Injectable} from '@nestjs/common';
import {DeviceDBModel} from '../api/models/device.db.model';
import {InjectModel} from '@nestjs/mongoose';
import {Device, DeviceDocument} from '../devices.schema';
import {Model} from 'mongoose';
import {DeviceViewModel} from '../api/models/device.view.model';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectModel(Device.name) private sessionModel: Model<DeviceDocument>,
  ) {}

  async createDevice(session: DeviceDBModel): Promise<DeviceViewModel> {
    return this.dataSource.query(`
    insert into "Devices"
    ("ip", "title", "lastActiveDate", "deviceId", "userId")
    values ($1, $2, $3, $4, $5)
    `, [
      session.ip,
      session.title,
      session.lastActiveDate,
      session.deviceId,
      session.userId,
    ])
  }

  async updateLastActiveDate(deviceId: string, date: Date) {
    return this.dataSource.query(`
    update "Devices"
    set "lastActiveDate" = $1
    where "deviceId" = $2
    `, [date, deviceId])
  }

  async deleteCurrentDevice(deviceId: string) {
    return this.dataSource.query(`
    delete from "Devices"
    where "deviceId" = $1
    `, [deviceId])
  }
  async deleteOtherDevices(deviceId: string, userId: string) {
    return this.dataSource.query(`
    delete from "Devices"
    where "deviceId" != $1 and "userId" = $2
    `, [deviceId, userId])
  }
  async deleteAllDevices(userId: string) {
    return this.dataSource.query(`
    delete from "Devices"
    where "userId" = $1
    `, [userId])
  }
}
