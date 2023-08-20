import {Injectable} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {SaltHashDto} from '../api/models/dto/salt.hash.dto';

@Injectable()
export class UsersService {
  async generateSaltAndHash(password: string): Promise<SaltHashDto> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return { salt, hash };
  }
}
