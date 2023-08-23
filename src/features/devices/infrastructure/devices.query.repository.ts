import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Device, DeviceDocument} from '../devices.schema';
import {Model} from 'mongoose';

import {DeviceViewModel} from '../api/models/device.view.model';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectModel(Device.name) private devicesModel: Model<DeviceDocument>,
  ) {}

  async getDevice(deviceId: string): Promise<DeviceViewModel | null> {
    const device = await this.dataSource.query(`
    select "ip", "title", "lastActiveDate", "deviceId"
    from "Devices"
    where "deviceId" = $1
    `, [deviceId])

    return device.length ? device[0] : null
  }

  async getDevices(userId: string): Promise<DeviceViewModel[]> {
    return this.dataSource.query(`
    select "ip", "title", "lastActiveDate", "deviceId"
    from "Devices"
    where "userId" = $1
    `, [userId])
  }
}
